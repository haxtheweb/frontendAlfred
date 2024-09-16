document.getElementById('apiForm').addEventListener('submit', function(event) {
    event.preventDefault();

    document.getElementById('spinner').style.display = 'block';

    const question = document.getElementById('question').value;
    const course = document.getElementById('course').value;
    const engine = document.getElementById('engine').value;

    const data = {
        question: question,
        course: course,
        engine: engine
    }; 

    const apiUrl = `https://ai.hax.cloud/api/askNew`;
//    const apiUrl = `http://localhost:3000/api/askNew`;

    fetch(apiUrl, {
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
        const content = data.data.answers.content;
        document.getElementById('response').innerText = content;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    })
    .finally(() => {
        document.getElementById('spinner').style.display = 'none';
    });
});


/*
document.getElementById('courseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const url = document.getElementById('courseCreate').value;
    const data = {
        url: url
    }; 

    const apiUrl = `https://ai.hax.cloud/api/addNewFromURL`;
//    const apiUrl = `http://localhost:3000/api/addNewFromURL`;
    fetch(apiUrl, {
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
        const content = data.data.message;
        document.getElementById('responseAdd').innerText = content;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    });
});
*/


document.getElementById('fetchButton').addEventListener('click', function() {
    const apiUrl = `https://ai.hax.cloud/api/fetchCourses`;
//    const apiUrl = `http://localhost:3000/api/fetchCourses`;

    fetch(apiUrl) 
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('course');
            dropdown.innerHTML = '';  
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '--Select a course--';
            dropdown.appendChild(defaultOption);

            data.forEach(course => {
                const newOption = document.createElement('option');
                newOption.value = course.value;
                newOption.textContent = course.label;
                dropdown.appendChild(newOption);
            });
        })
        .catch(error => console.error('Error fetching courses:', error));
});

document.getElementById('icdsForm').addEventListener('submit', function(event) {
    event.preventDefault();

    document.getElementById('spinner').style.display = 'block';

    const question = document.getElementById('icds-question').value;
    const course = document.getElementById('icds-course').value;

    const data = {
        query: question,
        course: course
    }; 

    const apiUrl = `https://ai.services.hax.psu.edu/call-ollama`;

    fetch(apiUrl, {
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
        const content = data.data.result.content;
        document.getElementById('response').innerText = content;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    })
    .finally(() => {
        document.getElementById('spinner').style.display = 'none';
    });
});