abstract class Item {
    static fromJSON(json: any): Item {
        throw new Error("Not implemented");
    }
    abstract toHTML(): HTMLElement;
}

class TimelineItem implements Item {
    constructor(
        public title: string,
        public location: string | undefined,
        public period: string,
        public details: string[],
    ) {}

    static fromJSON(json: any): TimelineItem {
        return new TimelineItem(json.title, json.location, json.period, json.details);
    }

    toHTML(): HTMLElement {
        const item = document.createElement("div");
        item.classList.add("timeline-item");
        const locationAndPeriod = this.location ? `${this.location} | <i>${this.period}</i>` : `<i>${this.period}</i>`;
        const detailsHTML = this.details.length === 1 
            ? `<p>${this.details[0]}</p>`
            : "<ul>" + this.details.map((line: string) => `<li><p>${line}</p></li>`).join("") + "</ul>";
        item.innerHTML = `
            <h5>${this.title}</h5>
            <p class="timeline-item-period">${locationAndPeriod}</p>
            ${detailsHTML}
        `;
        return item;
    }
}

type PublicationType = "journal" | "domestic" | "award";

class PublicationItem implements Item {
    constructor(
        public authors: string,
        public title: string,
        public venue: string,
        public date: string,
        public misc: string | undefined,
    ) {}

    static fromJSON(json: any): PublicationItem {
        return new PublicationItem(json.authors, json.title, json.venue, json.date, json.misc);
    }

    toHTML(): HTMLElement {
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
    constructor(
        public bioShort: string,
        public bioLong: string,
        public news: string[],
        public education: TimelineItem[],
        public publications: Record<PublicationType, PublicationItem[]>,
        public workExperience: TimelineItem[],
    ) {}
    static fromJSON(json: any): Data {
        return new Data(
            json.bio.short,
            json.bio.long,
            json.news,
            json.education.map((item: any) => TimelineItem.fromJSON(item)),
            Object.fromEntries(
                Object.entries(json.publications as {[key: string]: string[]}).map(
                    ([pubType, pubList]: [string, string[]]) => [pubType, pubList.map(PublicationItem.fromJSON)])) as Record<PublicationType, PublicationItem[]>,
            json.workExperience.map((item: any) => TimelineItem.fromJSON(item)),
        );
    }
}

function loadDataFromJson(): void {
    fetch("data/data.json")
        .then(response => response.json())
        .then((json: any) => {
            const data = Data.fromJSON(json);

            const bioShortElement = document.getElementById("bio-short") as HTMLElement;
            const bioLongElement = document.getElementById("bio-long") as HTMLElement;
            bioShortElement.innerHTML = data.bioShort;
            bioLongElement.innerHTML = data.bioLong;

             // Populate news section
             const newsList = document.getElementById("news-list") as HTMLElement;
             data.news.forEach(item => {
                 const newsItem = document.createElement("li");
                 newsItem.innerHTML = item;
                 newsList.appendChild(newsItem);
             });
            
            // Populate education section
            const educationList = document.getElementById("education-list") as HTMLElement;
            data.education.forEach(item => {
                const eduItem = item.toHTML();
                educationList.appendChild(eduItem);
            });
            
            // Populate publications section
            const publicationTypes: PublicationType[] = ["journal", "domestic", "award"];
            for (const publicationType of publicationTypes) {
                const publicationsList = document.getElementById(publicationType + "-list") as HTMLElement;
                data.publications[publicationType].forEach(item => {
                    const pubItem = item.toHTML();
                    publicationsList.appendChild(pubItem);
                });
            }
            
            // Populate work experience section
            const workExperienceList = document.getElementById("work-experience-list") as HTMLElement;
            data.workExperience.forEach(item => {
                const workItem = item.toHTML();
                workExperienceList.appendChild(workItem);
            });
        })
        .catch(error => console.error("Error loading JSON data:", error));
}

document.addEventListener("DOMContentLoaded", function () {
    loadDataFromJson();
    let navbarBrand = document.getElementById("navbar-brand") as HTMLElement;
    window.addEventListener("scroll", function () {
        if (window.scrollY >= 100) {
            navbarBrand.style.visibility = "visible";
        } else {
            navbarBrand.style.visibility = "hidden";
        }
    });
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        // Cast anchor to HTMLAnchorElement so TypeScript knows it's an anchor tag
        anchor.addEventListener("click", (e) => {
            e.preventDefault();
    
            // Get the target section
            const targetId = anchor.getAttribute("href") as string;
            const targetElement = document.querySelector(targetId) as HTMLElement;
            const navbarElement = document.querySelector('.navbar') as HTMLElement;
    
            // Adjust scroll position
            window.scrollTo({
                top: (targetElement as HTMLElement).offsetTop - navbarElement.offsetHeight, // Adjusted for navbar height
                behavior: 'smooth'
            });
        });
    });
    
});
