document.getElementById('apiForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const question = document.getElementById('question').value;
    const course = document.getElementById('course').value;
    const engine = document.getElementById('engine').value;

    const data = {
        question: question,
        course: course,
        engine: engine
    }; 

    fetch('https://frontend-alfred.vercel.app/api/askNew', {
    //fetch('http://localhost:3001/proxy', {
    //fetch('http://localhost:3000/api/askNew', {
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
        //const content = data.data.answers.content;
        //ORIG^^^
        const content = data.answers;
        document.getElementById('response').innerText = content;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    });
});
