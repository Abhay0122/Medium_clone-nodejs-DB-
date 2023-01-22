const user_menu_list = document.querySelector('.user_menu_list');
const menu_list_overlay = document.querySelector('#menu_list_overlay');

var flag = 1;
user_menu_list.addEventListener('click', () => {
    if (flag === 1) {
        menu_list_overlay.style.transform = 'scale(1)';
        flag = 0;
    }
    else {
        menu_list_overlay.style.transform = 'scale(0)';
        flag = 1;
    }

});

// textarea::

const openTextbox_btn = document.querySelector('#openTextbox_btn>i');
const openTextbox = document.querySelector('.openTextbox');
const abouttextarea_wrapper = document.querySelector('.abouttextarea_wrapper');

openTextbox_btn.addEventListener('click', () => {
    openTextbox.style.display = 'none';
    abouttextarea_wrapper.style.display = 'flex';
})











