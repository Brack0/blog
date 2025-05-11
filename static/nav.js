(() => {
	const darkTheme = "dark-theme";
	const lightTheme = "light-theme";
	const savedThemeKey = "theme";
	const savedTheme = localStorage.getItem(savedThemeKey);

	if (savedTheme) {
		document.documentElement.classList.add(savedTheme);
	}

	addEventListener("DOMContentLoaded", () => {
		const themeSwitch = document.querySelector('#theme-switch');
		const prefersLightTheme = window.matchMedia('(prefers-color-scheme: light)');

		if (prefersLightTheme.matches || savedTheme === lightTheme) {
			themeSwitch.checked = true;
		}

		themeSwitch.addEventListener('change', (event) => event.target.checked ? switchToLightTheme() : switchToDarkTheme());

		function switchToDarkTheme() {
			document.documentElement.classList.add(darkTheme);
			document.documentElement.classList.remove(lightTheme);
			localStorage.setItem(savedThemeKey, darkTheme);
		}

		function switchToLightTheme() {
			document.documentElement.classList.add(lightTheme);
			document.documentElement.classList.remove(darkTheme);
			localStorage.setItem(savedThemeKey, lightTheme);
		}
	});
})();

