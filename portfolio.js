
let PROJECTS = []; 

// Function to open the detail screen
function openProjectDetail(id) {
    const project = PROJECTS.find(p => p.id === id);
    if (!project) return;
    const detailScreen = document.getElementById('project-detail-screen');
    const detailTitle = document.getElementById('detail-title');
    const detailBody = document.getElementById('detail-body');

    detailTitle.textContent = project.title;
    detailBody.innerHTML = project.content;
    
    document.body.style.overflowY = 'hidden'; 
    
    gsap.to(detailScreen, { 
        x: '0%', 
        duration: 0.6, 
        ease: "power3.inOut" 
    });
    detailScreen.scrollTo(0, 0);
}

// Function to close the detail screen
function closeProjectDetail() {
    const detailScreen = document.getElementById('project-detail-screen');
    
    gsap.to(detailScreen, { 
        x: '100%', 
        duration: 0.6, 
        ease: "power3.inOut", 
        onComplete: () => {
            document.body.style.overflowY = 'auto'; 
        } 
    });
}

function renderProjectList() {
    const devUiUxList = document.getElementById('dev-ui-ux-list');
    const otherMediaList = document.getElementById('other-media-list');
    
    devUiUxList.innerHTML = '';
    otherMediaList.innerHTML = '';
    
    const devFragment = document.createDocumentFragment();
    const otherFragment = document.createDocumentFragment();
    
    PROJECTS.forEach((project, index) => {
        const item = document.createElement('div');
        item.className = 'project-item group py-4 transition duration-300 cursor-pointer';
        item.dataset.itemId = project.id; 
        item.setAttribute('onclick', `openProjectDetail('${project.id}')`); 
        
        item.innerHTML = `
            <h4 class="project-title text-4xl md:text-5xl font-bold uppercase mb-2 group-hover:text-white text-gray-600 transition duration-300">
                ${project.title}
            </h4>
            <p class="text-gray-400 text-lg font-light">
                ${project.summary}
            </p>
        `;
        
        if (project.category === 'dev-ui-ux') {
            devFragment.appendChild(item);
        } else {
            otherFragment.appendChild(item);
        }
    });

    devUiUxList.appendChild(devFragment);
    otherMediaList.appendChild(otherFragment);
}


function initializeProjectLogic() {

    renderProjectList();

    const previewImage = document.getElementById('project-preview-image');
    const initialPlaceholder = document.getElementById('initial-placeholder');
    const projectItems = document.querySelectorAll('.project-item');

    const options = {
        root: null, 
        rootMargin: '0px 0px -50% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.dataset.itemId;
            const projectData = PROJECTS.find(p => p.id === id); 

            if (entry.isIntersecting) {
                gsap.to(initialPlaceholder, { opacity: 0, duration: 0.5 });
                previewImage.src = projectData.image;
                gsap.to(previewImage, { opacity: 1, duration: 0.7 });
                entry.target.classList.add('active');
                
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, options);

    projectItems.forEach(item => {
        observer.observe(item);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    

    fetch('projects.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            PROJECTS = data; 
            initializeProjectLogic(); 
        })
        .catch(error => {
            console.error('Error loading the project data:', error);
        });
        
    // --- 2. CUSTOM CURSOR & HERO ANIMATION ---
    const customCursor = document.getElementById('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let cursorSize = 32;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        gsap.to(customCursor, { opacity: 1, duration: 0.3 });
    });
    
    gsap.ticker.add(() => {
        gsap.set(customCursor, { 
            x: mouseX - cursorSize / 2, 
            y: mouseY - cursorSize / 2, 
            duration: 0.1, 
            ease: "power2.out" 
        });
    });

    document.querySelectorAll('a, button, .project-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(customCursor, { scale: 1.8, borderWidth: 4, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(customCursor, { scale: 1, borderWidth: 2, duration: 0.3 });
        });
    });

    // --- Hero Section Animation ---
    gsap.to("#hero-subtitle", { opacity: 1, duration: 1.2, delay: 0.5, ease: "power2.out" });
    gsap.to("#hero-title", { 
        y: 0, 
        opacity: 1, 
        duration: 1.5, 
        delay: 0.8, 
        ease: "power3.out" 
    });
    gsap.to("#hero-cta", { opacity: 1, duration: 1, delay: 1.8 });


    // --- Mobile Menu Toggle ---
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuClose = document.getElementById('mobile-menu-close');

    mobileMenuBtn.addEventListener('click', () => {
        gsap.to(mobileMenu, { x: 0, duration: 0.5, ease: "power3.inOut" });
    });
    mobileMenuClose.addEventListener('click', () => {
        gsap.to(mobileMenu, { x: "100%", duration: 0.5, ease: "power3.inOut" });
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            gsap.to(mobileMenu, { x: "100%", duration: 0.5, ease: "power3.inOut" });
        });
    });
    
// --- 3. CUSTOM INTERACTIVE CANVAS BACKGROUND (Connecting Dots Network) ---
    
    const canvas = document.getElementById('interactive-bg');
    const ctx = canvas.getContext('2d');
    let width, height;
    let mousePos = { x: 0, y: 0 };
    
    const particleCount = 100; // Reduced count for performance and minimalism
    const particles = [];
    const maxDistance = 120; // Max distance for lines to connect
    const mouseRadius = 150; // Radius for mouse repulsion

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.2; // Slower velocity
            this.vy = (Math.random() - 0.5) * 0.2;
            this.radius = 1;
        }
        
        update() {
            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Boundary wrap
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            
            this.x = (this.x + width) % width;
            this.y = (this.y + height) % height;
            
            // Mouse Repulsion
            const dx = mousePos.x - this.x;
            const dy = mousePos.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < mouseRadius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouseRadius - dist) / mouseRadius * 0.05; // Gentle repulsion
                this.x -= Math.cos(angle) * force * 10;
                this.y -= Math.sin(angle) * force * 10;
            }
        }
        
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, 0.5)`; // Subtle white particles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function connectParticles() {
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    // Calculate opacity based on distance
                    const opacity = 1 - (dist / maxDistance);
                    
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`; // Very subtle lines (opacity 0.2)
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }

    function setup() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, width, height); // Clear frame completely, no trails/ghosting
        
        connectParticles();
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', setup);
    document.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    });

    // Start the canvas animation
    setup();
    draw();
});