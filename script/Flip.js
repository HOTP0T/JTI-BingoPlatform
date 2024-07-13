document.addEventListener("DOMContentLoaded", function() {
  const toggle = document.querySelector('.toggle');
  const flipCardInner = document.querySelector('.flip-card__inner');

  toggle.addEventListener('change', function() {
    if (this.checked) {
      flipCardInner.style.transform = 'rotateY(180deg)';
    } else {
      flipCardInner.style.transform = 'rotateY(0deg)';
    }
  });
});