function selectExam(type) {
    const card = document.getElementById(`${type}Card`);
    
    // Add selection animation
    card.classList.add('selected');
    
    setTimeout(() => {
        card.classList.remove('selected');
        
        // Show selection message
        let examName = '';
        switch(type) {
            case 'secondary':
                examName = 'Secondary Education Examination';
                break;
            case 'tertiary':
                examName = 'Tertiary Education Examination';
                break;
            case 'quiz':
                examName = 'Quick Quiz';
                break;
            default:
            console.error("Invalid exam type");
            return;
        }        
        window.location.href = `${type}/auth.html?examType=${type}`;
    }, 500);
}
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.exam-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    hidePreloader();
});


