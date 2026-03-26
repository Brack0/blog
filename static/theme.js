const themeSwitch = document.querySelector('#theme-switch');
if (!themeSwitch) { throw new Error('Theme switch element not found'); }
const darkTheme = "dark";
const lightTheme = "light";
const currentTheme = localStorage.getItem('theme');
const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;

themeSwitch.checked = prefersColorScheme === lightTheme;

if (currentTheme) {
    document.documentElement.classList.add(currentTheme);
    themeSwitch.checked = currentTheme === lightTheme;
}

themeSwitch.addEventListener('change', (event) => {
    const newTheme = event.target.checked ? lightTheme : darkTheme;
    const oldTheme = event.target.checked ? darkTheme : lightTheme;
    document.documentElement.classList.remove(oldTheme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
});
