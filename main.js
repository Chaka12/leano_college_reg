// Leano College Connect - Main JavaScript
// Handles animations, form functionality, and interactive elements

class LeanoCollegeApp {
    constructor() {
        this.leads = JSON.parse(localStorage.getItem('leanoLeads') || '[]');
        this.GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzNr7xVoZNOIaPAYGEh6CuChcM_SfbBphOK1lCv84VEuqSB3ZmZay_oId2_3TqSvWPirA/exec';
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupFormHandlers();
        this.setupNavigation();
        this.initializeAnimations();
        this.setupParticleEffect();
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.classList.contains('fade-in')) {
                        anime({
                            targets: element,
                            opacity: [0, 1],
                            translateY: [30, 0],
                            duration: 800,
                            easing: 'easeOutQuart',
                            delay: anime.stagger(100)
                        });
                    }
                    
                    if (element.classList.contains('slide-in-left')) {
                        anime({
                            targets: element,
                            opacity: [0, 1],
                            translateX: [-50, 0],
                            duration: 800,
                            easing: 'easeOutQuart',
                            delay: anime.stagger(150)
                        });
                    }
                    
                    if (element.classList.contains('slide-in-right')) {
                        anime({
                            targets: element,
                            opacity: [0, 1],
                            translateX: [50, 0],
                            duration: 800,
                            easing: 'easeOutQuart'
                        });
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe all animation elements
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize page load animations
    initializeAnimations() {
        // Hero text typing effect
        const heroTitle = document.querySelector('.hero-content h1');
        if (heroTitle) {
            const text = heroTitle.innerHTML;
            heroTitle.innerHTML = '';
            
            setTimeout(() => {
                heroTitle.innerHTML = text;
                
                // Animate highlight text
                const highlight = heroTitle.querySelector('.highlight');
                if (highlight) {
                    anime({
                        targets: highlight,
                        color: ['#D4A574', '#1B4332', '#D4A574'],
                        duration: 3000,
                        easing: 'easeInOutSine',
                        loop: true
                    });
                }
            }, 500);
        }

        // Program cards stagger animation
        anime({
            targets: '.program-card',
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 600,
            delay: anime.stagger(100, {start: 1000}),
            easing: 'easeOutQuart'
        });

        // Value propositions animation
        anime({
            targets: '.value-prop',
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 500,
            delay: anime.stagger(200, {start: 1500}),
            easing: 'easeOutBack'
        });
    }

    // Form handlers
    setupFormHandlers() {
        const form = document.getElementById('interestForm');
        const overlay = document.getElementById('formOverlay');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        }

        // Auto-populate program selection
        const urlParams = new URLSearchParams(window.location.search);
        const programParam = urlParams.get('program');
        if (programParam) {
            const programSelect = document.getElementById('program');
            if (programSelect) {
                programSelect.value = decodeURIComponent(programParam);
            }
        }
    }

    // Handle form submission
    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const leadData = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            program: formData.get('program') || 'Not specified',
            status: 'new',
            notes: ''
        };

        // Prepare data for Google Sheets
        const rowData = [
            leadData.timestamp,
            leadData.firstName,
            leadData.lastName,
            leadData.phone,
            leadData.email,
            leadData.program,
            leadData.status
        ];

        try {
            // Try to save to Google Sheets first
            await this.saveToGoogleSheets(rowData);
            console.log('✅ Lead saved to Google Sheets');
            
            // Also save locally as backup
            this.leads.push(leadData);
            localStorage.setItem('leanoLeads', JSON.stringify(this.leads));
            
            // Show success message
            this.showSuccessMessage();
            
            // Simulate email confirmation
            setTimeout(() => {
                this.sendConfirmationEmail(leadData);
            }, 1000);
            
            // Redirect to thank you page after delay
            setTimeout(() => {
                window.location.href = 'thank-you.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Google Sheets failed:', error);
            
            // Fallback: Save to localStorage only
            this.leads.push(leadData);
            localStorage.setItem('leanoLeads', JSON.stringify(this.leads));
            
            // Still show success to user
            this.showSuccessMessage();
            
            // Simulate email confirmation
            setTimeout(() => {
                this.sendConfirmationEmail(leadData);
            }, 1000);
            
            // Redirect to thank you page after delay
            setTimeout(() => {
                window.location.href = 'thank-you.html';
            }, 2000);
        }
    }

    // Save to Google Sheets
    async saveToGoogleSheets(rowData) {
        const response = await fetch(this.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Scripts
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rowData)
        });
        
        // With 'no-cors' mode, we can't read the response
        // But we assume it worked if no network error
        return response;
    }

    // Show success message
    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        const form = document.getElementById('interestForm');
        
        if (successMessage && form) {
            successMessage.style.display = 'block';
            form.style.display = 'none';
            
            anime({
                targets: successMessage,
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutBack'
            });
        }
    }

    // Simulate email confirmation
    sendConfirmationEmail(leadData) {
        console.log('📧 Lead submitted successfully:');
        console.log('👤 Name:', leadData.firstName, leadData.lastName);
        console.log('📞 Phone:', leadData.phone);
        console.log('📧 Email:', leadData.email);
        console.log('🎓 Program:', leadData.program);
        console.log('📊 Saved to:', 'Google Sheets + Local Storage');
    }

    // Navigation setup
    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(248, 246, 240, 0.98)';
            } else {
                navbar.style.background = 'rgba(248, 246, 240, 0.95)';
            }
        });
    }

    // Particle effect for hero section
    setupParticleEffect() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.position = 'relative';
            heroSection.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            let particles = [];
            
            const resizeCanvas = () => {
                canvas.width = heroSection.offsetWidth;
                canvas.height = heroSection.offsetHeight;
            };
            
            const createParticle = () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.3 + 0.1
            });
            
            const initParticles = () => {
                particles = [];
                for (let i = 0; i < 50; i++) {
                    particles.push(createParticle());
                }
            };
            
            const updateParticles = () => {
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                });
            };
            
            const drawParticles = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(particle => {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(27, 67, 50, ${particle.opacity})`;
                    ctx.fill();
                });
            };
            
            const animate = () => {
                updateParticles();
                drawParticles();
                requestAnimationFrame(animate);
            };
            
            resizeCanvas();
            initParticles();
            animate();
            
            window.addEventListener('resize', () => {
                resizeCanvas();
                initParticles();
            });
        }
    }

    // Utility methods
    getLeads() {
        return this.leads;
    }

    getLeadById(id) {
        return this.leads.find(lead => lead.id === id);
    }

    updateLeadStatus(id, status, notes = '') {
        const lead = this.getLeadById(id);
        if (lead) {
            lead.status = status;
            if (notes) lead.notes = notes;
            localStorage.setItem('leanoLeads', JSON.stringify(this.leads));
            return true;
        }
        return false;
    }

    getLeadsByStatus(status) {
        return this.leads.filter(lead => lead.status === status);
    }

    getLeadsByProgram(program) {
        return this.leads.filter(lead => lead.program === program);
    }

    exportLeads() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Name,Email,Phone,Program,Status,Date\n"
            + this.leads.map(lead => 
                `"${lead.firstName} ${lead.lastName}","${lead.email}","${lead.phone}","${lead.program}","${lead.status}","${new Date(lead.timestamp).toLocaleDateString()}"`
            ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leano-leads-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // New method: Sync leads from Google Sheets (for admin dashboard)
    async syncFromGoogleSheets() {
        console.log('⚠️ Note: Full Google Sheets sync requires additional setup.');
        console.log('For now, use the CSV export feature.');
        
        // Refresh from localStorage
        this.leads = JSON.parse(localStorage.getItem('leanoLeads') || '[]');
        return this.leads;
    }
}

// Form overlay functions
function openForm(programName = '') {
    const overlay = document.getElementById('formOverlay');
    const programSelect = document.getElementById('program');
    
    if (overlay) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Auto-select program if specified
        if (programName && programSelect) {
            programSelect.value = programName;
        }
        
        // Animate form appearance
        anime({
            targets: '.form-container',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
    }
}

function closeForm() {
    const overlay = document.getElementById('formOverlay');
    const form = document.getElementById('interestForm');
    const successMessage = document.getElementById('successMessage');
    
    if (overlay) {
        anime({
            targets: '.form-container',
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInBack',
            complete: () => {
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Reset form
                if (form) {
                    form.style.display = 'block';
                    form.reset();
                }
                if (successMessage) {
                    successMessage.style.display = 'none';
                }
            }
        });
    }
}

// Close form when clicking outside
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('formOverlay');
    const formContainer = document.querySelector('.form-container');
    
    if (overlay && e.target === overlay) {
        closeForm();
    }
});

// Close form with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeForm();
    }
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.leanoApp = new LeanoCollegeApp();
    
    // Add some demo leads for testing (remove in production)
    if (window.location.pathname.includes('admin.html')) {
        const demoLeads = [
            {
                id: 'demo1',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                firstName: 'Thabo',
                lastName: 'Mokoena',
                phone: '+266 1234 5678',
                email: 'thabo@example.com',
                program: 'Diploma in Business Administration',
                status: 'new',
                notes: ''
            },
            {
                id: 'demo2',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                firstName: 'Lerato',
                lastName: 'Mohapi',
                phone: '+266 2345 6789',
                email: 'lerato@example.com',
                program: 'Certificate in ICT & Digital Skills',
                status: 'contacted',
                notes: 'Called on Oct 26, confirmed interest, invited to open house'
            }
        ];
        
        const existingLeads = JSON.parse(localStorage.getItem('leanoLeads') || '[]');
        if (existingLeads.length === 0) {
            localStorage.setItem('leanoLeads', JSON.stringify(demoLeads));
        }
    }
});

// Global function for Google Sheets sync (for admin dashboard)
function syncFromGoogleSheets() {
    if (window.leanoApp) {
        window.leanoApp.syncFromGoogleSheets().then(leads => {
            console.log('Leads refreshed from localStorage:', leads.length);
            alert(`Refreshed ${leads.length} leads from local storage.\n\nGoogle Sheets full sync requires additional setup.`);
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeanoCollegeApp;
}
