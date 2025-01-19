const inputs = document.getElementsByClassName("input");
const username = document.getElementById("username");
const email = document.getElementById("email");
const pass1 = document.getElementById("pass1");
const pass2 = document.getElementById("pass2");
const button = document.getElementById("btn");

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
        for (let i = 0; i < inputs.length - 1; i++) {
            if (document.activeElement === inputs[i]) {
                if (inputs[i + 1] && i !== inputs.length - 2) {
                    inputs[i + 1].focus();
                } else {
                    inputs[0].focus();
                }
                break;
            }
        }
    } else if (event.key === "ArrowUp") {
        for (let i = 0; i < inputs.length - 1; i++) {
            if (document.activeElement === inputs[i]) {
                if (inputs[i - 1]) {
                    inputs[i - 1].focus();
                } else {
                    inputs[inputs.length - 2].focus();
                }
                break;
            }
        }
    } else if (event.key === "Enter") {
        checkEmpty();
        checkEmail();
        checkPasswords();
    }
});

button.addEventListener("click", () => {
    if (!checkEmpty() || !checkEmail() || !checkPasswords()) {
        return;
    } else {
        getValues();
    }
});

function checkEmpty() {
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "") {
            alert("One or more fields are empty");
            return false;
        }
    }
    return true;
}

function checkEmail() {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(email.value)) {
        alert("Invalid email address");
        return false;
    }
    return true;
}

function checkPasswords() {
    if (pass1.value !== pass2.value) {
        alert("Passwords don't match");
        return false;
    }
    return true;
}

async function getValues() {
    const firstName = inputs[0].value;
    const lastName = inputs[1].value;
    const usernameValue = inputs[2].value;
    const emailValue = inputs[3].value;
    const password = inputs[4].value;
    const birthdate = inputs[6].value;
    try {
        const response = await fetch("/signUp", {
            method: "POST",
            headers: { "Content-type": "application/json"},
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                username: usernameValue,
                email: emailValue,
                password: password,
                birthdate: birthdate
            })
        });
        const data = await response.json();
        if (data.message ==="User registered successfully") {
            window.location.href = data.redirect;
        } else {
            username.value = "";
            email.value = "";
            alert("Email or/and username already exist");
        }
    } catch (error) {
        console.error(error);
    }
}

