// Alt Text Generator Form
document.getElementById('altTextForm').addEventListener('submit', function(event) {
    event.preventDefault();

    document.getElementById('spinner').style.display = 'block';

    const imageUrl = document.getElementById('imageUrl').value;
    const keywords = document.getElementById('keywords').value;

    const data = {
        image_url: imageUrl,
        keywords: keywords
    };

    const apiUrl = `https://ai.services.hax.psu.edu/generate-alt-text`;

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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const responseDiv = document.getElementById('altText-response');
        responseDiv.innerHTML = `
            <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <h3>Alt Text:</h3>
                <p style="font-size: 16px; font-weight: bold; color: #2E7D32;">${data.alt_text}</p>
                <p><strong>Character Count:</strong> ${data.character_count}</p>
                <p><strong>Model:</strong> ${data.model}</p>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('altText-response').innerHTML = `
            <div style="background-color: #ffebee; border: 1px solid #f44336; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <p style="color: #c62828;"><strong>Error:</strong> ${error.message}</p>
                <p style="color: #666;">Please check the image URL and try again.</p>
            </div>
        `;
    })
    .finally(() => {
        document.getElementById('spinner').style.display = 'none';
    });
});

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
        course: course,
        hasSuggestions: false  // Add this line
    }; 

    //const apiUrl = `https://ai.services.hax.psu.edu/call-ollama`;
    const apiUrl = `https://ai.hax.cloud/api/apiProxy`;

    /*
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors'
    })
    */
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const content = data.result;
        document.getElementById('icds-response').innerText = content;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    })
    .finally(() => {
        document.getElementById('spinner').style.display = 'none';
    });
});


async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file!');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://ai.services.hax.psu.edu/upload-docx', { // Update the URL to match your server's endpoint
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('uploadResponse').innerText = 'File uploaded successfully: ';
        } else {
            const error = await response.json(); // Parse error response
            document.getElementById('uploadResponse').innerText = `File upload failed: ${error.detail || response.statusText}`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('uploadResponse').innerText = 'An error occurred during file upload.';
    }
}

document.getElementById('fetchButtonICDS').addEventListener('click', function() {

    const apiUrl = `https://ai.services.hax.psu.edu/fetch-docx-courses`;

    fetch(apiUrl) 
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('icds-course');
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




//new for building course
document.getElementById('buildCourseForm').addEventListener('submit', function(event) {
    event.preventDefault();

    document.getElementById('spinner').style.display = 'block';

    const question = document.getElementById('buildCourse').value;
    const course = "NEW";

    const data = {
        query: question,
        course: course
    }; 

    //const apiUrl = `https://ai.services.hax.psu.edu/call-ollama`;
    const apiUrl = `https://ai.hax.cloud/api/apiProxy`;

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const content = data.result;
        console.log("Content:", content);
        document.getElementById('buildCourse-response').innerText = content;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    })
    .finally(() => {
        document.getElementById('spinner').style.display = 'none';
    });
});