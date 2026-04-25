class Item {
    static fromJSON(json) {
        throw new Error("Not implemented");
    }
}
class TimelineItem {
    constructor(title, location, period, details) {
        this.title = title;
        this.location = location;
        this.period = period;
        this.details = details;
    }
    static fromJSON(json) {
        return new TimelineItem(json.title, json.location, json.period, json.details);
    }
    toHTML() {
        const item = document.createElement("div");
        item.classList.add("timeline-item");
        const locationAndPeriod = this.location ? `${this.location} | <i>${this.period}</i>` : `<i>${this.period}</i>`;
        const detailsHTML = this.details.length === 1
            ? `<p>${this.details[0]}</p>`
            : "<ul>" + this.details.map((line) => `<li><p>${line}</p></li>`).join("") + "</ul>";
        item.innerHTML = `
            <h5>${this.title}</h5>
            <p class="timeline-item-period">${locationAndPeriod}</p>
            ${detailsHTML}
        `;
        return item;
    }
}
class PublicationItem {
    constructor(authors, title, venue, date, misc) {
        this.authors = authors;
        this.title = title;
        this.venue = venue;
        this.date = date;
        this.misc = misc;
    }
    static fromJSON(json) {
        return new PublicationItem(json.authors, json.title, json.venue, json.date, json.misc);
    }
    toHTML() {
        const item = document.createElement("div");
        var itemText = `${this.authors}, <b>${this.title}</b>, ${this.venue}, ${this.date}.`;
        if (this.misc !== undefined) {
            itemText = itemText.concat(" ", this.misc);
        }
        item.innerHTML = `
            <div class="publication-item">
                <p>${itemText}</p> 
            </div>
        `;
        return item;
    }
}
class Data {
    constructor(bioShort, bioLong, news, education, publications, workExperience) {
        this.bioShort = bioShort;
        this.bioLong = bioLong;
        this.news = news;
        this.education = education;
        this.publications = publications;
        this.workExperience = workExperience;
    }
    static fromJSON(json) {
        return new Data(json.bio.short, json.bio.long, json.news, json.education.map((item) => TimelineItem.fromJSON(item)), Object.fromEntries(Object.entries(json.publications).map(([pubType, pubList]) => [pubType, pubList.map(PublicationItem.fromJSON)])), json.workExperience.map((item) => TimelineItem.fromJSON(item)));
    }
}
function loadDataFromJson() {
    fetch("data/data.json")
        .then(response => response.json())
        .then((json) => {
        const data = Data.fromJSON(json);
        const bioShortElement = document.getElementById("bio-short");
        const bioLongElement = document.getElementById("bio-long");
        bioShortElement.innerHTML = data.bioShort;
        bioLongElement.innerHTML = data.bioLong;
        // Populate news section
        const newsList = document.getElementById("news-list");
        data.news.forEach(item => {
            const newsItem = document.createElement("li");
            newsItem.innerHTML = item;
            newsList.appendChild(newsItem);
        });
        // Populate education section
        const educationList = document.getElementById("education-list");
        data.education.forEach(item => {
            const eduItem = item.toHTML();
            educationList.appendChild(eduItem);
        });
        // Populate publications section
        const publicationTypes = ["journal", "domestic", "award"];
        for (const publicationType of publicationTypes) {
            const publicationsList = document.getElementById(publicationType + "-list");
            data.publications[publicationType].forEach(item => {
                const pubItem = item.toHTML();
                publicationsList.appendChild(pubItem);
            });
        }
        // Populate work experience section
        const workExperienceList = document.getElementById("work-experience-list");
        data.workExperience.forEach(item => {
            const workItem = item.toHTML();
            workExperienceList.appendChild(workItem);
        });
    })
        .catch(error => console.error("Error loading JSON data:", error));
}
document.addEventListener("DOMContentLoaded", function () {
    loadDataFromJson();
    let navbarBrand = document.getElementById("navbar-brand");
    window.addEventListener("scroll", function () {
        if (window.scrollY >= 100) {
            navbarBrand.style.visibility = "visible";
        }
        else {
            navbarBrand.style.visibility = "hidden";
        }
    });
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        // Cast anchor to HTMLAnchorElement so TypeScript knows it's an anchor tag
        anchor.addEventListener("click", (e) => {
            e.preventDefault();
            // Get the target section
            const targetId = anchor.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            const navbarElement = document.querySelector('.navbar');
            // Adjust scroll position
            window.scrollTo({
                top: targetElement.offsetTop - navbarElement.offsetHeight,
                behavior: 'smooth'
            });
        });
    });
});
