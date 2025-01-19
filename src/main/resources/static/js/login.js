const inputs = document.getElementsByClassName("input");
const loginButton = document.getElementById("log");
const signInButton = document.getElementById("sign");
const user = document.getElementById("user");
const password = document.getElementById("password")


document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (document.activeElement === inputs[0]) {
            inputs[1].focus();
        } else {
            inputs[0].focus();
        }
    }
});

signInButton.addEventListener("click", () => {
    window.location.href = "/signUp";
    inputs.forEach(input => {
       input.value = "";
    });
});

loginButton.addEventListener("click", async () => {
    if (user.value === "" || password.value === "") {
        alert("One or more fields are empty");
    } else {
    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ username: user.value, password: password.value })
            });
            const data = await response.json();
            if (data.status === "success") {
                console.log(data);
                window.location.href = data.redirect;
            } else {
                alert("User or/and password are wrong");
                user.value = "";
                password.value = "";

            }
        } catch (error) {
            console.error(error);
        }
    }
});
