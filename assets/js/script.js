//NAV
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const links  = document.querySelector('.nav__links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  links.classList.toggle('open');
});

document.querySelectorAll('.nav__links a').forEach(a => {
  a.addEventListener('click', () => links.classList.remove('open'));
});

//INTERSECTION OBSERVER: Fade-in cards
const revealEls = document.querySelectorAll('.card-reveal');
const observer  = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

//CHART
const chartLabels = [
  'ChatGPT-4o', 'CAMeL-BERT', 'AraGPT2',
  'AraBERT+LSTM', 'AraBERT+CNN', 'AraBERT+RNN',
  'FastText+LSTM', 'FastText+CNN','FastText+RNN',
  'W2V+CNN', 'W2V+RNN', 'W2V+LSTM'
];
const accuracyData = [1.00, 0.94, 0.93, 0.90, 0.89, 0.89, 0.88, 0.88, 0.87, 0.81, 0.81, 0.80];
const f1NegData    = [1.00, 0.95, 0.94, 0.91, 0.90, 0.90, 0.90, 0.90, 0.89, 0.85, 0.84, 0.84];
const f1PosData    = [1.00, 0.93, 0.92, 0.88, 0.88, 0.87, 0.86, 0.84, 0.84, 0.77, 0.76, 0.74];

window.addEventListener('load', () => {
  const ctx = document.getElementById('resultsChart');
  if (!ctx) return;
  Chart.defaults.color = '#5c697a';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        { label: 'Accuracy', data: accuracyData, backgroundColor: 'rgba(59,158,255,0.75)', borderColor: 'rgba(59,158,255,1)', borderWidth: 1, borderRadius: 5, borderSkipped: false },
        { label: 'F1-Score (Neg)', data: f1NegData, backgroundColor: 'rgba(167,139,250,0.65)', borderColor: 'rgba(167,139,250,1)', borderWidth: 1, borderRadius: 5, borderSkipped: false },
        { label: 'F1-Score (Pos)', data: f1PosData, backgroundColor: 'rgba(0,229,212,0.55)', borderColor: 'rgba(0,229,212,1)', borderWidth: 1, borderRadius: 5, borderSkipped: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,18,32,0.95)', borderColor: 'rgba(59,158,255,0.25)', borderWidth: 1,
          titleColor: '#f0f4ff', bodyColor: '#94a3b8', padding: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(0)}%` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c697a', font: { size: 11 }, maxRotation: 30 } },
        y: { min: 0.7, max: 1.0, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#5c697a', font: { size: 11 }, callback: v => `${(v*100).toFixed(0)}%` } }
      }
    }
  });
});

//DEMO: Sentiment Analysis (simulated)
const positiveWords = [
  'رائع','ممتاز','جيد','رائعة','ممتازة','جيدة','جميل','مذهل','عالي','نظيف',
  'قريب','مريح','هادئ','أحببت','أنصح','سعيد','محترم','لطيف','ودود','مثالي',
  'فاخر','راقي','رائق','بديع','ممتع','رضا','أعجبني','استمتعت','الأفضل'
];
const negativeWords = [
  'سيء','ضعيف','ملوث','رديء','سيئة','ضعيفة','مروع','كارثي','تدني','خيبة',
  'مخيب','بطيء','صاخب','قديم','مكسور','لا أنصح','غير نظيف','غير مريح',
  'خسارة','نادم','محزن','مزعج','للغاية','فشل'
];

function normalizeArabic(text) {
  return text
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْـ]/g, '');
}

const negations = ['لا', 'ليس', 'لم', 'لن', 'ما', 'غير'];

function calculateSentiment(text) {
  text = normalizeArabic(text);

  let words = text.split(/\s+/);
  let score = 0;

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let prevWord = words[i - 1];

    let isNegated = negations.includes(prevWord);

    if (positiveWords.includes(word)) {
      score += isNegated ? -2 : 2;
    }

    if (negativeWords.includes(word)) {
      score += isNegated ? 2 : -2;
    }
  }

  // fallback si aucun mot trouvé
  if (score === 0) {
    return {
      sentiment: 'Neutral',
      confidence: 0.6
    };
  }

  let isPositive = score > 0;
  let confidence = Math.min(0.95, 0.6 + Math.abs(score) * 0.1);

  return {
    sentiment: isPositive ? 'Positive' : 'Negative',
    confidence
  };
}

function setExample(text) {
  document.getElementById('reviewInput').value = text;
}

function analyzeSentiment() {
  const input = document.getElementById('reviewInput');
  const output = document.getElementById('demoOutput');
  const text = input.value.trim();
  if (!text || text.length < 3) {
    output.classList.remove('has-result');
    output.innerHTML = '<div class="output__placeholder" style="color:var(--orange)"><p>Please enter an Arabic review first.</p></div>';
    return;
  }
  output.classList.remove('has-result');
  output.innerHTML = '<div class="output__placeholder"><div class="loading-spinner"></div><p>Analyzing sentiment&hellip;</p></div>';
  if (!document.getElementById('loading-style')) {
    const s = document.createElement('style');
    s.id = 'loading-style';
    s.textContent = '.loading-spinner{width:36px;height:36px;border:3px solid rgba(59,158,255,0.15);border-top-color:var(--blue);border-radius:50%;margin:0 auto 14px;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
  setTimeout(() => {
    const result = calculateSentiment(text);
    const isPos = result.sentiment === 'Positive';
    const confPercent = Math.round(result.confidence * 100);
    const cls = isPos ? 'positive' : 'negative';
    const emoji = isPos ? '😊' : '😞';
    const preview = text.length > 80 ? text.slice(0, 80) + '…' : text;
    output.classList.add('has-result');
    output.innerHTML = `
      <div class="output__result">
        <div class="output__sentiment output__sentiment--${cls}">${emoji} Sentiment: ${result.sentiment}</div>
        <p class="output__detail">Confidence: <strong>${confPercent}%</strong></p>
        <p class="output__detail">Model: <em>CAMeL-BERT (Simulated)</em></p>
        <div class="output__confidence"><div class="output__confidence-fill output__confidence-fill--${cls}" style="width:0%"></div></div>
        <div class="output__review-preview">"${preview}"</div>
      </div>`;
    setTimeout(() => {
      const fill = output.querySelector('.output__confidence-fill');
      if (fill) fill.style.width = confPercent + '%';
    }, 80);
  }, 800 + Math.random() * 400);
}

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('reviewInput');
  if (textarea) textarea.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') analyzeSentiment(); });
});

//NAV ACTIVE HIGHLIGHT────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navAnchors.forEach(a => { a.style.color = a.getAttribute('href') === '#' + id ? 'var(--text-1)' : ''; });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObs.observe(s));
