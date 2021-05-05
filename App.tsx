import { ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import { Renderer, TextureLoader } from 'expo-three'
import React, { useRef, useEffect, useState } from 'react'
import {
    AmbientLight,
    BoxBufferGeometry,
    Fog,
    GridHelper,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    PointLight,
    Scene,
    SpotLight,
} from 'three'
import { View } from 'react-native'

//expo camera
import { Camera } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'

export default function App() {
    let timeout

    React.useEffect(() => {
        // Clear the animation loop when the component unmounts
        return () => clearTimeout(timeout)
    }, [])

    const cameraRef = useRef()

    const coordinateX = useRef(0)
    const coordinateY = useRef(0)

    const [y, setY] = useState(0)

    useEffect(() => {
        const getPerm = async () => {
            const { status } = await Camera.requestPermissionsAsync()

            // setHasPermission(status === 'granted')
            // if (status === 'granted') {
            //     props.navigation.navigate('CameraScreen')
            // } else {
            //     return
            // }
        }
        getPerm()
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <Camera
                style={{
                    flex: 1,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    left: 0,
                    bottom: 0,
                }}
                ref={cameraRef}
                type={Camera.Constants.Type.front}
                // flashMode={flashMode}
                // zoom={zooming}
                onFacesDetected={(face) => {
                    // console.log(face.faces)
                    if (face.faces.length > 0) {
                        coordinateX.current = face.faces[0].noseBasePosition.y
                        coordinateY.current = face.faces[0].noseBasePosition.y

                        // console.log(face.faces)

                        // console.log(coordinateY.current.toFixed(1) / 100)
                    }
                }}
                faceDetectorSettings={{
                    mode: FaceDetector.Constants.Mode.fast,
                    detectLandmarks: FaceDetector.Constants.Landmarks.all,
                    runClassifications:
                        FaceDetector.Constants.Classifications.none,
                    minDetectionInterval: 100,
                    tracking: true,
                }}
            ></Camera>
            <GLView
                style={{
                    flex: 1,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    left: 0,
                    bottom: 0,
                }}
                onContextCreate={async (gl: ExpoWebGLRenderingContext) => {
                    const {
                        drawingBufferWidth: width,
                        drawingBufferHeight: height,
                    } = gl
                    const sceneColor = 'rgba(0,0,0)'

                    // Create a WebGLRenderer without a DOM element
                    const renderer = new Renderer({ gl })
                    renderer.setSize(width, height)
                    // renderer.setClearColor(sceneColor)

                    const camera = new PerspectiveCamera(
                        // closeness and farness of camera
                        20,
                        width / height,
                        1,
                        1000
                    )
                    camera.position.set(0, 50, 1)

                    const scene = new Scene()
                    scene.fog = new Fog(sceneColor, 1, 10000)
                    // scene.add(new GridHelper(10, 10))

                    const ambientLight = new AmbientLight(0x101010)
                    scene.add(ambientLight)

                    const pointLight = new PointLight(0xffffff, 2, 1000, 1)
                    pointLight.position.set(300, 400, 200)
                    scene.add(pointLight)

                    const spotLight = new SpotLight(0xffffff, 0.5)
                    spotLight.position.set(0, 100, 100)
                    spotLight.lookAt(scene.position)
                    scene.add(spotLight)

                    const cube = new IconMesh()

                    cube.position.set(0, 0, 0)

                    scene.add(cube)

                    camera.lookAt(cube.position)
                    // camera.up.set(0, 0, -10)

                    function update() {
                        // cube.rotation.Y +=
                        //     coordinateX.current.toFixed(1) / 10000
                        cube.rotation.x +=
                            coordinateY.current.toFixed(1) / 10000
                        // cube.translateX(coordinateX.current.toFixed(1) / 100000)
                        // cube.translateY(
                        //     -(coordinateY.current.toFixed(1) / 100000)
                        // )
                        // cube.translateX(coordinateX.current.toFixed(1) / 10000)
                        // cube.translateY(coordinateY.current.toFixed(1) / 100000)
                        // cube.translateZ(coordinateY.current.toFixed(1) / 100000)
                        // camera.translateZ(0.05)
                        // camera.rotateOnAxis(new THREE.Vector3(0, 0, 0), 3)
                    }

                    // Setup an animation loop
                    const render = () => {
                        timeout = requestAnimationFrame(render)
                        update()
                        renderer.render(scene, camera)
                        gl.endFrameEXP()
                    }
                    render()
                }}
            />
        </View>
    )
}

class IconMesh extends Mesh {
    constructor() {
        super(
            new BoxBufferGeometry(1.0, 1.0, 1.0),
            new MeshStandardMaterial({
                map: new TextureLoader().load(require('./assets/icon.png')),
                color: 0xff0000,
            })
        )
    }
}
