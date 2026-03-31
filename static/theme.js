const themeSwitch = document.querySelector('#theme-switch');

if (themeSwitch) {
    const darkTheme = "dark";
    const lightTheme = "light";
    const storedTheme = localStorage.getItem('theme');
    const currentTheme = storedTheme === darkTheme || storedTheme === lightTheme ? storedTheme : null;
    const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;

    const initialTheme = currentTheme || prefersColorScheme;
    document.documentElement.classList.add(initialTheme);
    themeSwitch.checked = initialTheme === lightTheme;

    themeSwitch.addEventListener('change', (event) => {
        const newTheme = event.target.checked ? lightTheme : darkTheme;
        const oldTheme = event.target.checked ? darkTheme : lightTheme;
        document.documentElement.classList.remove(oldTheme);
        document.documentElement.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}
