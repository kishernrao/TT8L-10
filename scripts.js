function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function navigateTo(page) {
    switch(page) {
        case 'assignments':
            window.location.href = 'assignments.html'; // Replace with actual assignment page URL
            break;
        case 'quizBank':
            window.location.href = 'quiz_bank.html'; // Replace with actual quiz bank page URL
            break;
        case 'createQuiz':
            window.location.href = 'create_quiz.html'; // Replace with actual create quiz page URL
            break;
        default:
            console.log('Page not found');
    }
}

