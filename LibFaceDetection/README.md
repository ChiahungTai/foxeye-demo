# opencvjs_demo_facedetection

## Download and build opencv.js
[OpenCV.js installation guide](https://github.com/kakukogou/opencv/tree/opencvjs)

## Compile

### Download this repository
<pre>
cd emscripten_build
</pre>

### Set the installation folder of OpenCV.js
In **Makefile**, assign the **OPENCV_INSTALL_DIR** to your local path.
```
OPENCV_INSTALL_DIR=<your_opencvjs_local_repository>/release_asm/install
```

### Build
<pre>
make
make install
</pre>
