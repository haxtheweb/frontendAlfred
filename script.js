document.getElementById('apiForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const question = document.getElementById('question').value;
    const course = document.getElementById('course').value;
    const engine = document.getElementById('engine').value;

    const data = {
        question: question,
        course: course
    };

//    fetch('https://askalfred.vercel.app/api/askNew', {
    fetch('https://askalfred.vercel.app', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
//        document.getElementById('response').innerText = data.your_returned_value;
        document.getElementById('response').innerText = data; 
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    });
});
