/* ============ EXAMPLE CARDS ============ */
// Maps each example card to a function that resets the list to a known
// starting state and runs the matching operation from operations.js.

const EXAMPLES = {
  insertHead: {title:'Insert at the head', build:()=>{ freshList([4,9,2]); return buildInsertHeadSteps(7); }},
  insertTail: {title:'Insert at the tail',  build:()=>{ freshList([4,9,2]); return buildInsertTailSteps(7); }},
  delete:     {title:'Delete a value',      build:()=>{ freshList([4,9,2]); return buildDeleteSteps(9); }},
  search:     {title:'Search for a value',  build:()=>{ freshList([4,9,2]); return buildSearchSteps(2); }},
  reverse:    {title:'Reverse the list',    build:()=>{ freshList([4,9,2]); return buildReverseSteps(); }}
};

const exampleCards = document.querySelectorAll('.example-card');
const currentExampleTitle = document.getElementById('currentExampleTitle');

function runExample(key, shouldScroll){
  stopPlay();
  const ex = EXAMPLES[key];
  const steps = ex.build();
  playSteps(steps);
  currentExampleTitle.textContent = ex.title;
  exampleCards.forEach(card=>{
    card.classList.toggle('active', card.dataset.ex === key);
  });
  if(shouldScroll){
    document.querySelector('.sim-panel').scrollIntoView({behavior:'smooth', block:'nearest'});
  }
}

exampleCards.forEach(card=>{
  card.addEventListener('click', ()=> runExample(card.dataset.ex, true));
});

// Run the first example on load so the simulation isn't blank when the page opens
// Pass false here so page does not jump down to sim on refresh
runExample('insertHead', false);