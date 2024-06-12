document.getElementById('apiForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const question = document.getElementById('question').value;
    const course = document.getElementById('course').value;
    const engine = document.getElementById('engine').value;

    const data = {
        question: question,
        course: course
    };

    fetch('https://askalfred.vercel.app/api/askNew', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('response').innerText = data.your_returned_value;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    });
});
