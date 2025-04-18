let currentChapter = 1;
const foundMessages = new Set(JSON.parse(localStorage.getItem('hauntedRoots_foundMessages') || '[]'));

function updateProgressIndicator() {
    const totalMessages = story.chapters.reduce((total, chapter) => 
        total + chapter.hiddenMessages.length, 0);
    
    document.getElementById('found-count').textContent = foundMessages.size;
    document.getElementById('total-count').textContent = totalMessages;
}

function displayChapter(chapterId) {
    const chapter = story.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    document.getElementById('chapter-title').textContent = chapter.title;
    
    const content = chapter.content.split(' ').map(word => {
        const hiddenMessage = chapter.hiddenMessages.find(msg => 
            msg.trigger.toLowerCase() === word.toLowerCase().replace(/[.,!?]/g, ''));
        
        if (hiddenMessage) {
            return `<span class="highlighted-text" data-message-id="${hiddenMessage.id}">${word}</span>`;
        }
        return word;
    }).join(' ');
    
    document.getElementById('chapter-content').innerHTML = content;
    
    // Update navigation buttons
    document.getElementById('prev-chapter').disabled = chapterId === 1;
    document.getElementById('next-chapter').disabled = chapterId === story.chapters.length;
    
    // Add click listeners to highlighted words
    document.querySelectorAll('.highlighted-text').forEach(element => {
        element.addEventListener('click', revealHiddenMessage);
    });
    
    // Clear previous hidden messages
    document.getElementById('hidden-messages').innerHTML = '';
}

function revealHiddenMessage(event) {
    const messageId = event.target.dataset.messageId;
    const chapter = story.chapters.find(ch => 
        ch.hiddenMessages.some(msg => msg.id === messageId));
    
    if (!chapter) return;
    
    const hiddenMessage = chapter.hiddenMessages.find(msg => msg.id === messageId);
    if (!hiddenMessage || foundMessages.has(messageId)) return;
    
    foundMessages.add(messageId);
    localStorage.setItem('hauntedRoots_foundMessages', 
        JSON.stringify(Array.from(foundMessages)));
    
    const messageElement = document.createElement('div');
    messageElement.className = 'hidden-message';
    messageElement.textContent = hiddenMessage.message;
    
    document.getElementById('hidden-messages').appendChild(messageElement);
    
    // Trigger animation
    setTimeout(() => messageElement.classList.add('visible'), 10);
    
    updateProgressIndicator();
}

function previousChapter() {
    if (currentChapter > 1) {
        currentChapter--;
        displayChapter(currentChapter);
    }
}

function nextChapter() {
    if (currentChapter < story.chapters.length) {
        currentChapter++;
        displayChapter(currentChapter);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateProgressIndicator();
    displayChapter(currentChapter);
});