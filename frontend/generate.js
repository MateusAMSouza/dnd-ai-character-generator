const { default: axios } = require('axios');

const classInput = document.getElementById("classInput");
const levelInput = document.getElementById("levelInput");
const searchButton = document.getElementById("searchButton");


searchButton.addEventListener("click", () => {
    console.log('Button pressed')
    const className = classInput.value.toLowerCase();
    const level = levelInput.value;
    if(className) {
        searchClass(className, level, info);
    }
});

function searchClass(className, level) {
    axios
        .get(`https://www.dnd.co/api/classes`)
        .then((response) => {
            const classes = response.data.results;
            const matchedClass = classDnD.find(
                (classDnD) => classDnD.name.toLowerCase() === className
            );

            if(matchedClass) {
                if(level > 0 && level < 21) {
                    var redirectURL = `/${classDnD}/${level}`;
                    window.location.href = redirectURL;
                }
            } else {
                additionalInfo.innerHTML = "Invalid class."
            }
        })
        .catch((error) => {
            additionalInfo.innerHTML = "Error fetching classes.";
        });
}