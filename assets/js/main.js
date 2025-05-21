class DarkLightMode {
    constructor() {
        this.root = document.documentElement;
        this.switcherBtn = document.querySelector(".darkModeScitcher");
        this.btnIcon = document.querySelector(".darkModeScitcher i");
    }

    verifyLastMode() {
        if(localStorage.getItem("darkMode") === "isDark") {
            this.btnIcon.classList.remove("fa-moon");
            this.btnIcon.classList.add("fa-sun");
            this.btnIcon.title = "الوضع الفاتح";
            this.root.classList.add("dark-mode");
        } 
    }
    switchTo() {
        this.switcherBtn.addEventListener("click", _ => this.switcher());
    }
    switcher() {
        this.root.classList.toggle("dark-mode");
        if(this.root.classList.contains("dark-mode")) {
            this.btnIcon.classList.remove("fa-moon");
            this.btnIcon.classList.add("fa-sun");
            this.btnIcon.title = "الوضع الفاتح";
            localStorage.setItem("darkMode", "isDark");
        }
        else {
            this.btnIcon.classList.remove("fa-sun");
            this.btnIcon.classList.add("fa-moon");
            this.btnIcon.title = "الوضع الداكن";
            localStorage.setItem("darkMode", "isNotDark");
        } 
    }
}

class UserTime {
    constructor() {
        this.currentTime = "15:02";
        this.dikrCategorie = "none";
        this.getUserTime();
    }

    getUserTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
    }

async getSalattime() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(success => {
            const { latitude, longitude } = success.coords;
            const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const t = data.data.timings;
                    if(this.currentTime >= t.Fajr && this.currentTime < t.Dhuhr) this.dikrCategorie = "morning";
                    else if(this.currentTime >= t.Dhuhr && this.currentTime < t.Maghrib) this.dikrCategorie = "afternoon";
                    else this.dikrCategorie = "night";

                    resolve(this.dikrCategorie);
                });
        }, error => {
            console.error("حدث خطأ أثناء تحديد الموقع:", error);
            reject(error);
        });
    });
}

}

class SlideShow {
    constructor(categorie) {
        this.categorie = categorie;
        this.currentSlide = 0;
        this.fetchData();
        this.slides;
        this.dikrText = document.querySelector(".dikr-text");
        this.dikrSrc = document.querySelector(".dikr-src");
    }

    async fetchData() {
        const rep = await fetch('assets/js/data.json');
        const data = await rep.json();
        this.slides = data.categories.find(cat => cat.title === this.categorie).slides;
        this.defaultDikr();
    }

    defaultDikr() {
        let cat;
        switch(this.categorie) {
            case "morning": cat = "أذكار الصباح"; break; 
            case "afternoon": cat = "أذكار المساء"; break; 
            case "night": cat = "أذكار النوم"; break; 
            default: cat = "حدث خطأ";
        }
        document.querySelector(".adkar-type").textContent = cat;
        this.dikrText.textContent = this.slides[this.currentSlide].text;
        this.dikrSrc.textContent = this.slides[this.currentSlide].src;
    }

    clickArrow() {
        document.querySelector(".arrow-left").addEventListener("click", _ => this.switchSlidesLeft());
        document.querySelector(".arrow-right").addEventListener("click", _ => this.switchSlidesRight());
        document.querySelectorAll(".dot").forEach(dot => {
            dot.addEventListener("click", e => { 
                if(e.currentTarget.classList.contains("active")) return;
                document.querySelectorAll(".dot").forEach(dot => dot.classList.remove("active"));
                this.switchSlide(e)});
        });
    }

    switchSlidesLeft() {
        if(this.currentSlide >= 2) return;
        this.currentSlide++;
        document.querySelectorAll(".dot").forEach(dot => dot.classList.remove("active"));
        document.querySelectorAll(".dot")[this.currentSlide].classList.add("active");
        this.dikrText.textContent = this.slides[this.currentSlide].text;
        this.dikrSrc.textContent = this.slides[this.currentSlide].src;
    }
    switchSlidesRight() {
        if(this.currentSlide <= 0) return;
        this.currentSlide--;
        document.querySelectorAll(".dot").forEach(dot => dot.classList.remove("active"));
        document.querySelectorAll(".dot")[this.currentSlide].classList.add("active");
        this.dikrText.textContent = this.slides[this.currentSlide].text;
        this.dikrSrc.textContent = this.slides[this.currentSlide].src;
    }
    switchSlide(e) {
        e.currentTarget.classList.add("active");
        this.dikrText.textContent = this.slides[e.currentTarget.getAttribute("attr")].text;
        this.dikrSrc.textContent = this.slides[e.currentTarget.getAttribute("attr")].src;
        this.currentSlide = e.currentTarget.getAttribute("attr");
    }
}

// main

(async () => {
    const mode = new DarkLightMode();
    mode.verifyLastMode();
    mode.switchTo();

    const salatTime = new UserTime();
    await salatTime.getSalattime();

    const slider = new SlideShow(salatTime.dikrCategorie);
    slider.clickArrow();
})();