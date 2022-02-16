//alert("the Following statement is false ");
console.log("this is a log" );

// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
import { RhinoCompute } from 'https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'

const definitionName = 'perlin noise maze.gh'

// Set up sliders
const radius_slider = document.getElementById('radius')
radius_slider.addEventListener('mouseup', onSliderChange, false)
radius_slider.addEventListener('touchend', onSliderChange, false)

const count_slider = document.getElementById('count')
count_slider.addEventListener('mouseup', onSliderChange, false)
count_slider.addEventListener('touchend', onSliderChange, false)

const time_slider = document.getElementById('time')
time_slider.addEventListener('mouseup', onSliderChange, false)
time_slider.addEventListener('touchend', onSliderChange, false)

const scale_slider = document.getElementById('scale')
scale_slider.addEventListener('mouseup', onSliderChange, false)
scale_slider.addEventListener('touchend', onSliderChange, false)

const seed_slider = document.getElementById('seed')
seed_slider.addEventListener('mouseup', onSliderChange, false)
seed_slider.addEventListener('touchend', onSliderChange, false)

const tube_slider = document.getElementById('tube')
tube_slider.addEventListener('mouseup', onSliderChange, false)
tube_slider.addEventListener('touchend', onSliderChange, false)


const loader = new Rhino3dmLoader()
loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/')

let rhino, definition, doc
rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.')
    rhino = m // global

    //RhinoCompute.url = getAuth( 'RHINO_COMPUTE_URL' ) // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
    //RhinoCompute.apiKey = getAuth( 'RHINO_COMPUTE_KEY' )  // RhinoCompute server api key. Leave blank if debugging locally.


    RhinoCompute.url = 'http://localhost:8081/' //if debugging locally.

    // load a grasshopper file!
    const url = definitionName
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const arr = new Uint8Array(buffer)
    definition = arr

    init()
    compute()
})

async function compute() {
    
//params 
     const param1 = new RhinoCompute.Grasshopper.DataTree('radius')
     console.log(radius_slider.valueAsNumber)
     param1.append([0], [radius_slider.valueAsNumber])

     const param2 = new RhinoCompute.Grasshopper.DataTree('count')
     console.log(count_slider.valueAsNumber)
     param2.append([0], [count_slider.valueAsNumber])

     const param3 = new RhinoCompute.Grasshopper.DataTree('time')
     console.log(time_slider.valueAsNumber)
     param3.append([0], [time_slider.valueAsNumber])

     const param4 = new RhinoCompute.Grasshopper.DataTree('scale')
     console.log(scale_slider.valueAsNumber)
     param4.append([0], [scale_slider.valueAsNumber])

     const param5 = new RhinoCompute.Grasshopper.DataTree('seed')
     console.log(seed_slider.valueAsNumber)
     param5.append([0], [seed_slider.valueAsNumber])

     const param6 = new RhinoCompute.Grasshopper.DataTree('tube')
     console.log(tube_slider.valueAsNumber)
     param6.append([0], [tube_slider.valueAsNumber])


    // // clear values
    const trees = []
    trees.push(param1)
    trees.push(param2)
    trees.push(param3)
    trees.push(param4)
    trees.push(param5)
    trees.push(param6)
    

    const res = await RhinoCompute.Grasshopper.evaluateDefinition(definition, trees)

   // console.log(res)

    doc = new rhino.File3dm()

    // hide spinner
    document.getElementById('loader').style.display = 'none'

    //decode grasshopper objects and put them into a rhino document
    for (let i = 0; i < res.values.length; i++) {
        for (const [key, value] of Object.entries(res.values[i].InnerTree)) {
          for (const d of value) {
            const data = JSON.parse(d.data);
            const rhinoObject = rhino.CommonObject.decode(data);
            doc.objects().add(rhinoObject, null);
          }
        }
      }
// go through the objects in the Rhino document

let objects = doc.objects();
for ( let i = 0; i < objects.count; i++ ) {

  const rhinoObject = objects.get( i );


   // asign geometry userstrings to object attributes
  if ( rhinoObject.geometry().userStringCount > 0 ) {
    const g_userStrings = rhinoObject.geometry().getUserStrings()
    rhinoObject.attributes().setUserString(g_userStrings[0][0], g_userStrings[0][1])
               
  }
}

   // clear objects from scene
  scene.traverse(child => {
      if (!child.isLight) {
          scene.remove(child)
      }
  })

   // download button handler
function download () {
    let buffer = doc.toByteArray()
    let blob = new Blob([ buffer ], { type: "application/octect-stream" })
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = '3d_perlin_noise_one.3dm'
    link.click()
    }
    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse(buffer, function (object) {
        console.log(object)
        scene.add(object)
        // hide spinner
        document.getElementById('loader').style.display = 'none'

    })
}


function onSliderChange() {
    //show spinner
    document.getElementById('loader').style.display = 'block'
    compute()
}


 // BOILERPLATE //

 let scene, camera, renderer, controls
  
 function init() {
 
     // create a scene and a camera
     scene = new THREE.Scene()
     scene.background = new THREE.Color(1, 1, 1)
     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
     camera.position.z = - 30
 
     // create the renderer and add it to the html
     renderer = new THREE.WebGLRenderer({ antialias: true })
     renderer.setSize(window.innerWidth, window.innerHeight)
     document.body.appendChild(renderer.domElement)
 
     // add some controls to orbit the camera
     controls = new OrbitControls(camera, renderer.domElement)
 
     // add a directional light
     const directionalLight = new THREE.DirectionalLight(0xffffff)
     directionalLight.intensity = 2
     scene.add(directionalLight)
 
     const ambientLight = new THREE.AmbientLight()
     scene.add(ambientLight)
 
     animate()
 }
 
 function animate() {
     requestAnimationFrame(animate)
     renderer.render(scene, camera)
 }
 
 function onWindowResize() {
     camera.aspect = window.innerWidth / window.innerHeight
     camera.updateProjectionMatrix()
     renderer.setSize(window.innerWidth, window.innerHeight)
     animate()
 }
 
 function meshToThreejs(mesh, material) {
     const loader = new THREE.BufferGeometryLoader()
     const geometry = loader.parse(mesh.toThreejsJSON())
     return new THREE.Mesh(geometry, material)
}