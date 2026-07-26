/* ============ STEP PLAYBACK ============ */
// which step array is loaded, which index, whether autoplay is running 
// render handles actual drawingfor each step

let currentSteps = [];
let stepIdx = 0;
let playTimer = null;

// Loads a new sequence of steps (from an operations.js builder) and shows the first one
function playSteps(steps){
  currentSteps = steps;
  stepIdx = 0;
  stopPlay();
  render(currentSteps[0], stepIdx, currentSteps.length);
  updateStepButtons();
}

function goToStep(i){
  if(i<0 || i>=currentSteps.length) return;
  stepIdx = i;
  render(currentSteps[stepIdx], stepIdx, currentSteps.length);
  updateStepButtons();
}

function updateStepButtons(){
  document.getElementById('stepPrev').disabled = stepIdx<=0;
  document.getElementById('stepNext').disabled = stepIdx>=currentSteps.length-1;
}

function stopPlay(){
  if(playTimer){ clearInterval(playTimer); playTimer=null; }
  document.getElementById('stepPlay').innerHTML = '&#9654;';
}

document.getElementById('stepPrev').onclick = ()=>{ stopPlay(); goToStep(stepIdx-1); };
document.getElementById('stepNext').onclick = ()=>{ stopPlay(); goToStep(stepIdx+1); };
document.getElementById('stepPlay').onclick = ()=>{
  if(playTimer){ stopPlay(); return; }
  document.getElementById('stepPlay').innerHTML = '&#10074;&#10074;';
  playTimer = setInterval(()=>{
    if(stepIdx >= currentSteps.length-1){ stopPlay(); return; }
    goToStep(stepIdx+1);
  }, 1400);
};