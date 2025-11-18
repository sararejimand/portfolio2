
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
    const detailBody = document.getElementById('detail-body'); 

    detailBody.querySelectorAll('video').forEach(video => {
        video.pause();
        video.currentTime = 0; 
    });

    detailBody.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.src) {
            iframe.src = iframe.src; 
        }
    });

    gsap.to(detailScreen, { 
        x: '100%', 
        duration: 0.6, 
        ease: "power3.inOut", 
        onComplete: () => {
            document.body.style.overflowY = 'auto';
        } 
    });
}

// Function to render the project list
function renderProjectList() {
    const universityList = document.getElementById('university-projects-list');
    const personalList = document.getElementById('personal-projects-list');
    universityList.innerHTML = '';
    personalList.innerHTML = '';
    
    const universityFragment = document.createDocumentFragment();
    const personalFragment = document.createDocumentFragment();
    
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

        if (project.scope === 'university') {
            universityFragment.appendChild(item);
        } else {
            personalFragment.appendChild(item);
        }
    });

    universityList.appendChild(universityFragment);
    personalList.appendChild(personalFragment);
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
        
    // --- CURSOR ---
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
    
    // --- CANVAS BACKGROUND (Subtle Geometric Noise Grid) ---
(function () {
    const canvas = document.getElementById('tf-noise');
    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height, frameId;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
    }

    function renderNoise() {
      // Create a small offscreen tile and stamp it for speed
      const tileSize = 128;
      const off = document.createElement('canvas');
      off.width = tileSize;
      off.height = tileSize;
      const octx = off.getContext('2d');

      const imageData = octx.createImageData(tileSize, tileSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = 128 + Math.random() * 60; // mid-gray noise
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 40; // alpha controls strength; tuned by CSS opacity
      }
      octx.putImageData(imageData, 0, 0);

      // Fill the main canvas with the noise tile
      const cols = Math.ceil(width / tileSize);
      const rows = Math.ceil(height / tileSize);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.drawImage(off, x * tileSize, y * tileSize);
        }
      }
    }

    function loop() {
      // Slightly clear to avoid stacking alpha
      ctx.clearRect(0, 0, width, height);
      renderNoise();
      frameId = requestAnimationFrame(loop);
    }

    // Handle DPR changes and resizes
    window.addEventListener('resize', () => {
      cancelAnimationFrame(frameId);
      resize();
      loop();
    }, { passive: true });

    resize();
    loop();
  })();
  
});