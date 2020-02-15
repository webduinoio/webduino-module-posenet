+(function (window, document) {
  'use strict';

  function loadJS(filePath) {
    var req = new XMLHttpRequest();
    req.open("GET", filePath, false); // 'false': synchronous.
    req.send(null);
    var headElement = document.getElementsByTagName("head")[0];
    var newScriptElement = document.createElement("script");
    newScriptElement.type = "text/javascript";
    newScriptElement.text = req.responseText;
    headElement.appendChild(newScriptElement);
  }
  
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  loadJS('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
  loadJS('https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet');

  window.__WaPosenet__ = (function () {
    let net;
    let outputs = [];

    class CanvasPainter {
      constructor(canvas) {
        if (canvas) this.setCanvas(canvas);
        this.colors = [
          '#91f98c',
          '#81eced',
        ];
      }

      setCanvas(canvas, opts = {}) {
        this.canvas = {
          el: canvas,
          ctx: canvas.getContext('2d'),
        }
        canvas.id = 'wa-posenet-canvas'
        canvas.style = "width: 100%; height: 100%;";

        if (opts.flipHorizontal) {
          let headElement = document.getElementsByTagName("head")[0];
          let style = document.createElement("style");
          headElement.appendChild(style);
          style.appendChild(
            document.createTextNode(
              '#wa-posenet-canvas{-webkit-transform: scaleX(-1);transform: scaleX(-1);}'
            )
          );
        }
      }

      drawKeypoints(poseResults) {
        if (!this.canvas) return;
        const ctx = this.canvas.ctx;
        poseResults.forEach((person, index) => {
          let adjpoints = posenet.getAdjacentKeyPoints(person.keypoints);
          adjpoints.forEach(points => {
            this.drawLine(
              this.getPos(points[0].position), this.getPos(points[1].position), this.colors[index], 1, ctx
            )
          })
          person.keypoints.forEach(keypoint => {
            ctx.fillStyle = this.colors[index];
            ctx.fillRect(keypoint.position.x, keypoint.position.y , 5, 5);
          });
        })
      }

      drawLine([ay, ax], [by, bx], color, scale, ctx) {
        ctx.beginPath();
        ctx.moveTo(ax * scale, ay * scale);
        ctx.lineTo(bx * scale, by * scale);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      getPos({y, x}) {
        return [y, x];
      }

      show(input) {
        if (!this.canvas) return;
        const ctx = this.canvas.ctx;
        ctx.drawImage(input, 0, 0);
      }
    }

    return {
      init: async function(imageSource, duel = false) {
        if (imageSource.search(/^{\"source/) >= 0 && hasGetUserMedia()) {
          const inputObj = JSON.parse(imageSource);
                imageSource = inputObj.source;
          const resolution = inputObj.resolution.split('x');
          const video = document.createElement('video');
          const canvas = document.createElement('canvas');
          const deviceId = imageSource.replace('webcam_', '');
          let constraints = window.constraints = {
            audio: false,
            video: {
              width: {
                exact: resolution[0],
              },
              height: {
                exact: resolution[1],
              },
              deviceId: {
                exact: deviceId,
              }
            },
          };
  
          if (deviceId.search(/^mobile/) >= 0) {
            let facingMode = { exact: 'environment' };
            if (deviceId === 'mobile_front') facingMode.exact = 'user';
            constraints.video.deviceId = undefined;
            constraints.video.facingMode = facingMode;
          } else if (deviceId === 'auto') {
            constraints.video.deviceId = undefined;
          }

          let cvpainter = new CanvasPainter();
          function predictWithVideo() {
            net.estimateMultiplePoses(video, {
              flipHorizontal: false,
              maxDetections: duel ? 2 : 1,
              scoreThreshold: 0.5,
              nmsRadius: 20,
            }).then(pose => {
              outputs = pose ? pose : outputs;
              cvpainter.show(video);
              cvpainter.drawKeypoints(outputs);
            });
            window.requestAnimationFrame(predictWithVideo);
          }

          try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const videoTracks = stream.getVideoTracks();
            console.log('device', deviceId);
            console.log('Got stream with constraints:', constraints);
            console.log(`Using video device: ${videoTracks[0].label}`);
            window.stream = stream; // make variable available to browser console
            const v = constraints.video;
            video.width = v.width && v.width.exact || '640';
            video.height = v.height && v.height.exact || '480';
            video.srcObject = stream;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.style = 'display: none;';
            video.setAttribute('playsinline', true);

            document.body.appendChild(video);
            document.body.appendChild(canvas);
            // add listener
            video.addEventListener('loadedmetadata', async () => {
              canvas.setAttribute('width', video.width);
              canvas.setAttribute('height', video.height);
              cvpainter.setCanvas(canvas, {flipHorizontal: inputObj.flipHorizontal});

              net = await posenet.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                inputResolution: { width: video.width, height: video.height},
                multiplier: 0.75,
              });
              window.requestAnimationFrame(predictWithVideo);
            });
          } catch (error) {
            if (error.name === 'ConstraintNotSatisfiedError') {
              const v = constraints.video;
              console.error(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
            } else if (error.name === 'PermissionDeniedError') {
              console.error('Permissions have not been granted to use your camera and ' +
              'microphone, you need to allow the page access to your devices in ' +
              'order for the demo to work.');
            } 
            console.error(`getUserMedia error: ${error.name}`, error);
            document.body.innerText = error.name;
          }
        }
      },

      getResult: function(person, keypoint, valname) {
        if (outputs.length < 1) return null;
        else if (!outputs[person]) return null;
        const output = outputs[person];
        const part = output.keypoints[keypoint];
        const position = part.position;
        return part && (valname !== 'score' ? Math.round(position[valname]) : part.score) || null;
      },
    }
  })();
}(window, window.document));
