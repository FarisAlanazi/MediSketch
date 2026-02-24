// const url = 'api';

// const data = {
//   {
//     "username": "",
//     "email": "",
//     "password": "",
//     "phone_number": "",
//     "address": "",
//     "user_type": ""
// }
// };

// async function sendTraineeData() {
//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(data)
//         });

//         if (!response.ok) {
//             throw new Error(error${response.status});
//         }

//         const result = await response.json();
//         console.log('done!', result);

//     } catch (error) {
//         console.error('error', error);
//     }
// }

// sendTraineeData();

const url = "http://127.0.0.1:8000/Doctor/";

const fetchData = async () => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

fetchData();
