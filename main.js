import './style.css'

//CANVAS
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
context.imageSmoothingEnabled= false
context.imageSmoothingQuality = 'high'

var pencilColor = '#c0392b'

context.strokeStyle = pencilColor
context.canvas.width = 800
context.canvas.height = 600
var pos = { x: 0, y: 0 }

//CURSORS
const cursors = [{
  cursorPencil:{
    lineWidth:5,
    lineCap : 'round',
    img : 'var(--cursorPencil)'
    },
  cursorBucket: {
      
      img : 'var(--cursorFill)'
    },
  cursorBrush: {
      lineWidth:5,
      lineCap: 'square',
      img : 'var(--brush)'
    },
  cursorSpray: {
    lineWidth: 2,
    lineCap: 'round',
    img: 'var(--spray)',
    width: 10
  },
  cursorEraser:{
    img:'var(--erase)',
    lineCap: 'square',
    lineWidth: 10
  }
}]

var cursorActual = cursors[0].cursorPencil
var image = document.createElement('img')

//DOMelements

const form = document.getElementById('form')
const inputColor = document.getElementById('inputColor')
const pencilBtn = document.getElementById('pencilBtn')
const brushBtn = document.getElementById('brushBtn')
const fillBtn = document.getElementById('fillBtn')
const eraseBtn = document.getElementById('eraseBtn')
const sprayBtn = document.getElementById('sprayBtn')
const lineWidthBtn = document.getElementById('lineWidth')
const sprayWidth = document.getElementById('spray')
const putImgBtn = document.getElementById('putImgBtn')
const inputFileBtn = document.getElementById('inputFile')
const dialog = document.getElementById('dialog')
const cancelBtn = document.getElementById('cancel')
const aceptBtn = document.getElementById('aceptBtn')
const ancord = document.getElementById('link')
const clearBtn = document.getElementById('clearBtn')

//EVENTS 
canvas.addEventListener('mousemove', draw)
canvas.addEventListener('mousedown', setPosition)
canvas.addEventListener('mousedown', (e)=>{if(cursorActual===cursors[0].cursorPicker){pick(e)}})
canvas.addEventListener('mousedown', (e)=>{if(cursorActual === cursors[0].cursorBucket){startPainting(e)}})
canvas.addEventListener('mouseenter', setPosition)
form.addEventListener('submit', resize)
inputColor.addEventListener('change', changeColor)
clearBtn.addEventListener('click', clearCanvas)
pencilBtn.addEventListener('click', changeTool)
brushBtn.addEventListener('click', changeTool)
fillBtn.addEventListener('click', changeTool)
eraseBtn.addEventListener('click', changeTool)
sprayBtn.addEventListener('click', changeTool)
lineWidthBtn.addEventListener('change', changeLineWidth)
sprayWidth.addEventListener('change', changeSprayWidth)
putImgBtn.addEventListener('click', ()=>{document.getElementById('inputFile').click()})
inputFileBtn.addEventListener('change', function(e) {
  handleImgChange(e)
  dialog.showModal()
})
cancelBtn.addEventListener('click', function(){
  dialog.close()
})
aceptBtn.addEventListener('click', putImage)
ancord.addEventListener('click', downloadCanvas)



//FUNCTIONS
function setPosition(e) {
  var rect = canvas.getBoundingClientRect()
  pos.x = e.clientX- rect.left
  pos.y = e.clientY - rect.top
  }

function downloadCanvas(e){
  
  let link = document.getElementById('link')
  let image = canvas.toDataURL('image/jpeg')
  link.href = image
  link.download = 'paint.png'
  
}

// resize canvas
 function resize(e) {
  e.preventDefault()
  var widht = form[0].value
  var height = form[1].value
  const imgData = context.getImageData(0, 0, canvas.width, canvas.height)
  context.canvas.width = widht
  context.canvas.height = height
  context.putImageData(imgData, 0, 0)
  
}

function draw(e) {
 
if (e.buttons !== 1) return
if(cursorActual === cursors[0].cursorEraser){
  context.beginPath()
  canvas.style.cursor = cursorActual.img
  context.lineWidth = cursorActual.lineWidth
  context.lineCap = cursorActual.lineCap
  setPosition(e)
  context.clearRect(pos.x, pos.y-5, cursorActual.lineWidth, cursorActual.lineWidth)
  
  }
  
  else if(cursorActual === cursors[0].cursorPencil || cursorActual === cursors[0].cursorBrush){
  context.beginPath()
  context.lineJoin= 'bevel'
  canvas.style.cursor = cursorActual.img
  context.lineWidth = cursorActual.lineWidth
  context.lineCap = cursorActual.lineCap
  context.strokeStyle = pencilColor
  context.moveTo(pos.x, pos.y)
  setPosition(e)
  context.lineTo(pos.x, pos.y)
  context.stroke() 
  }
  else if(cursorActual === cursors[0].cursorSpray){
    
    generateSprayParticules(e)
  }
 
}

function changeColor(e){
  pencilColor = e.currentTarget.value
}
function changeLineWidth(e){
  cursorActual.lineWidth = e.currentTarget.value
}
function changeSprayWidth(e){
  cursorActual.width = e.currentTarget.value
}
function changeTool(e){
  
  if(e.currentTarget.value==='cursorPencil'){
    cursorActual = cursors[0].cursorPencil
    canvas.style.cursor = cursorActual.img
    sprayWidth.disabled= true
    
    
  }
  if(e.currentTarget.value==='cursorBucket'){
    cursorActual = cursors[0].cursorBucket
    canvas.style.cursor = cursorActual.img
    sprayWidth.disabled= true
  }
  if(e.currentTarget.value==='cursorBrush'){
    cursorActual = cursors[0].cursorBrush
    canvas.style.cursor = cursorActual.img
    sprayWidth.disabled= true 
  }
  if(e.currentTarget.value==='cursorEraser'){
    cursorActual = cursors[0].cursorEraser
    canvas.style.cursor = cursorActual.img
    sprayWidth.disabled= true 
  }
  if(e.currentTarget.value==='cursorSpray'){
    cursorActual = cursors[0].cursorSpray
    canvas.style.cursor = cursorActual.img
    sprayWidth.disabled=false
  }
  

}


function handleImgChange(e) {
       
  if(e.target.files[0]){
    const reader = new FileReader()
    reader.onload = async function(e){
     image.src = e.target.result
     
      }
    reader.readAsDataURL(e.target.files[0])
} 

}
function putImage(e){
  e.preventDefault()
  context.drawImage(image, 0, 0)
  dialog.close()
}

function clearCanvas(){
  context.clearRect(0, 0, canvas.width, canvas.height);
 }

function generateSprayParticules(e){
 
  var density =  cursorActual.lineWidth
  for (var i = 0; i < density; i++) {
    var offset = getRandomOffset(cursorActual.width)
    var x = pos.x + offset.x
    var y = pos.y + offset.y
   
  context.beginPath()
  canvas.style.cursor = cursorActual.img
  context.lineWidth = cursorActual.lineWidth
  context.lineCap = cursorActual.lineCap
  context.strokeStyle = pencilColor
  context.moveTo(x, y)
  setPosition(e)
  context.lineTo(x, y)
  context.stroke() 

    
    }
}

function getRandomOffset(radius){
  var random_angle = (Math.random())*(2*Math.PI)
  var random_radius = Math.random() * radius

  return {
    x: Math.cos(random_angle) * random_radius,
    y: Math.sin(random_angle) * random_radius
  }

}


function startPainting(event) {
    
    const color = pencilColor
    const x = Math.floor(event.pageX - canvas.offsetLeft)
    const y = Math.floor(event.pageY - canvas.offsetTop)
    fillBucket(x, y, color)
  }


  function fillBucket(startX, startY, fillColor) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const targetColor = getPixelColor(imageData, startX, startY)

    if (targetColor === fillColor) {
      return
    }

    const stack = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const pixel = stack.pop()
      const x = Math.floor(pixel.x)
      const y = Math.floor(pixel.y)

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        continue
      }

      if (getPixelColor(imageData, x, y) === targetColor) {
        setPixelColor(imageData, x, y, fillColor)
        stack.push({ x: x + 1, y: y })
        stack.push({ x: x - 1, y: y })
        stack.push({ x: x, y: y + 1 })
        stack.push({ x: x, y: y - 1 })
      }
    }

    context.putImageData(imageData, 0, 0)
  }
  

  function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4
    return (
      '#' +
      ('00' + imageData.data[index].toString(16)).slice(-2) +
      ('00' + imageData.data[index + 1].toString(16)).slice(-2) +
      ('00' + imageData.data[index + 2].toString(16)).slice(-2)
    )
  }

  function setPixelColor(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4
    const rgba = hexToRgb(color)
    imageData.data[index] = rgba.r
    imageData.data[index + 1] = rgba.g
    imageData.data[index + 2] = rgba.b
    imageData.data[index + 3] = 255
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return { r, g, b }
  }

  
