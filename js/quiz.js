/* ============ QUIZ ============ */

const quizData = [
  {
    q: 'When you insert a new node at the head of a linked list, what happens to the existing nodes?',
    opts: ['They all shift one position to the right', 'They stay in the exact same place in memory', 'They get copied to new memory locations', 'Their values change'],
    correct: 1,
    explanation: 'This is the core idea of a linked list: only pointers change. The existing nodes never move.'
  },
  {
    q: 'Why is inserting at the tail O(n) instead of O(1) like inserting at the head?',
    opts: ['Tail insertion requires more memory', 'You have to walk the whole list to find the current tail first', 'The list has to be sorted first', 'It isn\'t actually slower'],
    correct: 1,
    explanation: 'Without a tail pointer, the only way to find the end is to follow next pointers all the way there.'
  },
  {
    q: 'What does it mean when a node\'s "next" is null?',
    opts: ['The node is broken', 'The node has no value', 'The node is the last one in the list', 'The list is empty'],
    correct: 2,
    explanation: 'Null next is how traversal knows it has reached the end of the linked list.'
  },
  {
    q: 'After reversing a linked list, what is true?',
    opts: ['The nodes are in new memory locations', 'Every pointer now points to what used to be the previous node', 'The values inside each node are swapped', 'The list becomes a tree'],
    correct: 1,
    explanation: 'Reverse doesn\'t touch values or move nodes — it just flips the direction every arrow points.'
  }
];

const quizContainer = document.getElementById('quizContainer');
const quizScore = document.getElementById('quizScore');
let answered = 0, correctCount = 0;

quizData.forEach((item, qi)=>{
  const card = document.createElement('div');
  card.className='quiz-card';

  const qEl = document.createElement('div');
  qEl.className='quiz-q';
  qEl.textContent = (qi+1)+'. '+item.q;
  card.appendChild(qEl);

  const optsEl = document.createElement('div');
  optsEl.className='quiz-opts';

  const fbEl = document.createElement('div');
  fbEl.className='quiz-fb';

  let done = false;
  item.opts.forEach((opt, oi)=>{
    const b = document.createElement('button');
    b.className='quiz-opt';
    b.textContent = opt;
    b.onclick = ()=>{
      if(done) return;
      done = true;
      answered++;

      const isCorrect = oi===item.correct;
      if(isCorrect){
        b.classList.add('correct');
        correctCount++;
        fbEl.innerHTML = '<strong>Correct.</strong> '+item.explanation;
      } else {
        b.classList.add('wrong');
        optsEl.children[item.correct].classList.add('correct');
        fbEl.innerHTML = '<strong>Not quite.</strong> The correct answer is highlighted above. '+item.explanation;
      }

      fbEl.classList.add('show');
      quizScore.textContent = 'Score: '+correctCount+' / '+answered+' answered ('+quizData.length+' total)';
    };
    optsEl.appendChild(b);
  });

  card.appendChild(optsEl);
  card.appendChild(fbEl);
  quizContainer.appendChild(card);
});