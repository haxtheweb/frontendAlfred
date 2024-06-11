document.getElementById('apiForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const input1 = document.getElementById('input1').value;
    const input2 = document.getElementById('input2').value;
    const dropdown = document.getElementById('dropdown').value;
    
    const data = {
        input1: input1,
        input2: input2,
        dropdown: dropdown
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
        document.getElementById('response').innerText = JSON.stringify(data, null, 2); // Display the raw JSON response

    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    });
});
