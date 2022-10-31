// Start of disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})();
// End of disabling form submissions if there are invalid fields

// autocomplete function start
function resetIfNoCity(el) {
    //just for beeing sure that nothing is done if no value selected
    if (el.value == "")
        return;
    var options = el.list.options;
    for (var i = 0; i < options.length; i++) {
        if (el.value == options[i].value)
            //option matches: work is done
            return;
    }
    //no match was found: reset the value
    el.value = "";
}
// autocomplete function end

// start of copy link
const copyBtn = document.getElementById('publishSpan');
copyBtn.onclick = () => {
    const dummy = document.createElement('input');
    const thisUrl = window.location.href;
    document.body.appendChild(dummy);
    dummy.value = thisUrl;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    alert('Kopirano!');
};
// end of copy link

// start of share to facebook
const shareToFB = document.getElementById('publishA');
const thisUrl = window.location.href;
shareToFB.href = "https://www.facebook.com/share.php?u=" + thisUrl;
// end of share to facebook

