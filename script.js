// ==========================================
// Preloader Logic (Global Scope)
// ==========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }
});

// Safety Timeout for Preloader (Force hide after 3.5s)
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('fade-out')) {
        console.log("Preloader safety timeout triggered.");
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }
}, 3500);

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Supabase Configuration
    // ==========================================
    // REPLACE THESE with your actual Supabase URL and Anon Key from Project Settings > API
    const SUPABASE_URL = 'https://mnfixkfuldsxrzhsfqfs.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_s8-_dV4Pc_e0aVJeEi-zXQ_Frj8B4Zb';
    
    let supabase = null;
    if (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // Scroll handling for sticky header
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.classList.add('menu-overlay');
    body.appendChild(overlay);

    function toggleMenu() {
        navMenu.classList.toggle('open');
        overlay.classList.toggle('open');

        // Toggle icon between list and x
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('open')) {
            icon.classList.remove('ph-list');
            icon.classList.add('ph-x');
            body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            icon.classList.remove('ph-x');
            icon.classList.add('ph-list');
            body.style.overflow = '';
        }
    }

    mobileToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close mobile menu when clicking a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Offset for header
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-list a[href="#${sectionId}"]`);

            // Only toggle active class if navLink exists and it's not the highlight button
            if (navLink && !navLink.classList.contains('highlight')) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    // Remove active from all
                    document.querySelectorAll('.nav-link:not(.highlight)').forEach(link => {
                        link.classList.remove('active');
                    });
                    navLink.classList.add('active');
                }
            }
        });
    });

    // Set current year in footer
    const yearElem = document.getElementById('year');
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }

    // ==========================================
    // Smart Order Popup Logic
    // ==========================================
    const orderModal = document.getElementById('order-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const orderForm = document.getElementById('order-form');
    const orderProductInput = document.getElementById('order-product');
    const orderNameInput = document.getElementById('order-name');
    const orderPhoneInput = document.getElementById('order-phone');
    const orderQtyInput = document.getElementById('order-qty');
    const orderNotesInput = document.getElementById('order-notes');

    let selectedOrderFiles = [];

    function openOrderModal(productName) {
        if (orderProductInput) orderProductInput.value = productName;
        if (orderModal) orderModal.classList.add('show');
    }

    function closeOrderModal() {
        if (orderModal) orderModal.classList.remove('show');
        if (orderForm) orderForm.reset();
        selectedOrderFiles = [];
        if (typeof updateOrderImagePreviews === 'function') {
            updateOrderImagePreviews();
        }
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeOrderModal);

    // Intercept WhatsApp links for product orders
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        // Skip links that don't have '?text=' (like the generic footer float)
        if (link.href.includes('?text=') && (link.classList.contains('service-link') || link.classList.contains('btn'))) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Extract product name from href text
                const urlParams = new URLSearchParams(link.href.split('?')[1]);
                const textBody = urlParams.get('text') || '';

                let productName = 'Custom Request';
                if (textBody.includes('Order Now: ')) {
                    productName = textBody.split('Order Now: ')[1];
                } else if (textBody.includes('interested in ')) {
                    productName = textBody.split('interested in ')[1];
                } else if (textBody.includes('custom quote for ')) {
                    productName = textBody.split('custom quote for ')[1];
                }
                openOrderModal(productName);
            });
        }
    });

    // Handle Combo offer buttons
    document.querySelectorAll('.btn-combo-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = e.currentTarget.getAttribute('data-product');
            if (product) openOrderModal(product);
        });
    });

    // Handle file name display in custom uploader
    const orderImageInput = document.getElementById('order-image');
    const fileNameDisplay = document.getElementById('file-name-display');
    const orderImagePreview = document.getElementById('order-image-preview');

    function updateOrderImagePreviews() {
        if (!orderImagePreview) return;
        orderImagePreview.innerHTML = '';

        selectedOrderFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'order-preview-item';

            const img = document.createElement('img');
            img.alt = 'Preview';
            
            // Generate visual object URL for the image
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
            
            // Clean up object URL when image loads to prevent memory leaks
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
            };
            
            previewItem.appendChild(img);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'order-preview-remove';
            removeBtn.innerHTML = '×';
            removeBtn.setAttribute('aria-label', 'Remove image');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedOrderFiles.splice(index, 1);
                updateOrderImagePreviews();
            });
            previewItem.appendChild(removeBtn);

            orderImagePreview.appendChild(previewItem);
        });

        if (fileNameDisplay) {
            if (selectedOrderFiles.length === 0) {
                fileNameDisplay.textContent = 'Choose Image...';
                fileNameDisplay.style.color = '#64748b';
            } else {
                fileNameDisplay.textContent = 'Add another photo click again';
                fileNameDisplay.style.color = 'var(--clr-brand-primary)';
            }
        }
    }

    if (orderImageInput) {
        orderImageInput.addEventListener('change', () => {
            if (orderImageInput.files) {
                for (let i = 0; i < orderImageInput.files.length; i++) {
                    selectedOrderFiles.push(orderImageInput.files[i]);
                }
                orderImageInput.value = ''; // Reset input value so same files can be re-uploaded
                updateOrderImagePreviews();
            }
        });
    }

    // Limit phone input to exactly 10 digits and numbers only
    if (orderPhoneInput) {
        orderPhoneInput.addEventListener('input', () => {
            let val = orderPhoneInput.value.replace(/\D/g, ''); // Remove non-digits
            if (val.length > 10) {
                val = val.substring(0, 10);
            }
            orderPhoneInput.value = val;
        });
    }

    // Handle form submission and generate WhatsApp link
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate phone number
            const phone = orderPhoneInput.value.trim();
            if (phone.length !== 10) {
                alert("Please enter a valid 10-digit phone number.");
                return;
            }

            // Track Order Initiation
            if (typeof fbq !== 'undefined') fbq('track', 'InitiateCheckout');
            if (typeof gtag !== 'undefined') gtag('event', 'begin_checkout', { items: [{ item_name: orderProductInput.value }] });

            const submitBtn = orderForm.querySelector('.whatsapp-submit-btn');
            const originalBtnContent = submitBtn.innerHTML;
            
            const product = orderProductInput.value;
            const name = orderNameInput.value;
            const qty = orderQtyInput.value;
            const notes = orderNotesInput.value;
            const hasFiles = selectedOrderFiles.length > 0;
            
            let photoUrls = [];
            let fileNames = [];

            // Step 1: Upload to Supabase if files exist
            if (hasFiles && supabase) {
                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<i class="ph-bold ph-spinner ph-spin"></i> Uploading Photos (${selectedOrderFiles.length})...`;
                    
                    for (const file of selectedOrderFiles) {
                        const name = file.name;
                        fileNames.push(name);
                        const fileExt = name.split('.').pop();
                        const filePath = `orders/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                        const { data, error } = await supabase.storage
                            .from('customer-uploads') // Ensure this bucket is created in Supabase with Public access
                            .upload(filePath, file);

                        if (error) throw error;

                        const { data: { publicUrl } } = supabase.storage
                            .from('customer-uploads')
                            .getPublicUrl(filePath);
                        
                        photoUrls.push(publicUrl);
                    }
                } catch (error) {
                    console.error("Upload failed:", error);
                    // Continue with WhatsApp even if upload fails
                }
            } else if (hasFiles) {
                for (const file of selectedOrderFiles) {
                    fileNames.push(file.name);
                }
            }

            // Step 2: Generate Premium Message Branding
            let waMessage = `✨ *SS MAGIC PRINTERS - NEW ORDER* ✨\n\n`;
            waMessage += `📦 *Product:* ${product}\n`;
            waMessage += `🔢 *Quantity:* ${qty}\n`;
            waMessage += `👤 *Customer:* ${name}\n`;
            waMessage += `📞 *Phone:* ${phone}\n`;
            
            if (notes.trim() !== '') {
                waMessage += `📝 *Notes:* ${notes}\n`;
            }

            if (photoUrls.length > 0) {
                waMessage += `\n📸 *Photo Links (${photoUrls.length}):*\n`;
                photoUrls.forEach((url, index) => {
                    waMessage += `${index + 1}. ${url}\n`;
                });
                waMessage += `✅ *Photos Uploaded:* The designs are ready for download!`;
            } else if (hasFiles) {
                waMessage += `\n🖼️ *Attached Photos (${fileNames.length}):*\n`;
                fileNames.forEach((filename, index) => {
                    waMessage += `${index + 1}. ${filename}\n`;
                });
                waMessage += `⚠️ *[ACTION REQUIRED]:* Please attach these photos to this chat now!`;
            } else {
                waMessage += `\n⚠️ *[NO PHOTOS ATTACHED]*`;
            }

            waMessage += `\n\n--- \nPlease share payment and delivery details to confirm my order.`;

            // Redirect to WhatsApp (Primary Order Line)
            const encodedMessage = encodeURIComponent(waMessage);
            window.open(`https://wa.me/917731879736?text=${encodedMessage}`, '_blank');

            // Cleanup
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            closeOrderModal();
        });
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            closeOrderModal();
        }
    });

    // ==========================================
    // Lightweight Chatbot FAQ Logic
    // ==========================================
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

    if (chatbotToggle) {
        // Bot Data Matrix
        const botData = {
            price: "Our Premium Photo Frames (12x8) start at ₹750, with Designer Mugs starting from just ₹250. We provide specialized pricing for bulk orders and corporate gifting.",
            products: "We offer an elite range of customized gifts: Museum-Grade Wall Frames (up to 12x36), Artisan Mugs, Corporate T-Shirts, Revolving Wooden Lamps, Interactive Magic Pillows, and Personalized Bottles.",
            frames: "Explore our wall frames: 12x8 (₹750), 12x20 (₹1050), 12x24 (₹1150), and our grand 12x36 (₹1350). Each includes professional mounting and finish.",
            mugs: "Our collection includes Normal Handle Mugs (₹250), Premium Heart Handle Mugs (₹350), and our signature Magic Mugs with Heart Handle (₹550).",
            tshirts: "Premium apparel: White Promotional (₹180), Children's (₹250), Black Full Sleeve (₹350), and Corporate T-Shirts (₹450). We also offer custom Caps (₹180) and Masks (₹60).",
            pillows: "Cozy memories: Standard Heart/Square Pillows (₹550), Normal Pillows (₹549 - ₹649), Magic Pillows (₹650), and LED Photo Pillows (₹750).",
            clocks: "Keep time with your memories using our Custom Photo Clocks starting from ₹750.",
            led: "Illuminate your home: Heart Rotating Lamps (₹850), Small Revolving (₹1050), Big Revolving (₹1180), and Pentagon Lamps (₹1350).",
            keys: "Premium keepsakes: Custom Acrylic Keychains (₹200), Laser Metal Marked Keychains (₹200), Personalized Matte Black Metal Keychains (₹200), and our Rotating Photo Keychain (₹350). Standard single-side keychains start at ₹100. We also offer Personalized Bottles starting from ₹350 (up to ₹650).",
            delivery: "We offer lightning-fast Same Day Delivery within Kurnool for most personalized items, ensuring your gift arrives fresh and on time.",
            contact: "📞 <b>Unified Support Hotline:</b> +91 77318 79736 (Available for both branches!)",
            location: "📍 <b>Shop 01:</b> Shop No.48, Jagadeesh Mall, Birla Compound, near Walmart, Kurnool – 518002.<br>📍 <b>Shop 02:</b> Shop No.37, Ground Floor, Skandhanshi Prithvi Commercial Complex, RS Road Circle, Kurnool – 518004.<br><br>💬 <i>Both locations are reachable via our unified hotline: +91 77318 79736</i>",
            fallback: "I'd love to help you further! Please connect with us on WhatsApp for a personalized consultation.",
            process: "It's simple: Tap 'Order on WhatsApp', share your favorite photos, and our designers will craft a masterpiece just for you!"
        };

        function toggleChatbot() {
            chatbotWindow.classList.toggle('hidden');
        }

        chatbotToggle.addEventListener('click', toggleChatbot);
        chatbotClose.addEventListener('click', toggleChatbot);

        // Scroll to bottom helper
        function scrollToBottom() {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        // Append Message helper
        function appendMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-msg ${sender}-msg`;
            msgDiv.innerHTML = `<p>${text}</p>`;
            chatbotMessages.appendChild(msgDiv);
            scrollToBottom();
        }

        // Typing effect simulation
        function simulateTyping(callback) {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-msg bot-msg typing-indicator';
            typingDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
            chatbotMessages.appendChild(typingDiv);
            scrollToBottom();

            setTimeout(() => {
                typingDiv.remove();
                callback();
            }, 600);
        }

        // Handle Quick Replies
        quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const queryType = btn.getAttribute('data-query');
                const userText = btn.innerText;

                // Add user message to UI
                appendMessage(userText, 'user');

                // Disable buttons temporarily to prevent spam tracking
                quickReplyBtns.forEach(b => b.style.pointerEvents = 'none');

                // Add typing indicator, then the bot response
                simulateTyping(() => {
                    const responseText = botData[queryType] || botData.fallback;
                    let finalHTML = responseText;

                    // For 'fallback' or end-funnel questions, append a visual CTA link to WhatsApp inside the chat block
                    if (queryType === 'fallback' || queryType === 'price' || queryType === 'process') {
                        finalHTML += `<br><a href="https://wa.me/917731879736" target="_blank" class="chat-action-btn">Chat on WhatsApp</a>`;
                    }

                    appendMessage(finalHTML, 'bot');

                    // Re-enable buttons
                    quickReplyBtns.forEach(b => b.style.pointerEvents = 'auto');
                });
            });
        });
    }

    // ==========================================
    // Reviews View More Toggle
    // ==========================================
    const viewMoreReviewsBtn = document.getElementById('view-more-reviews-btn');
    if (viewMoreReviewsBtn) {
        viewMoreReviewsBtn.addEventListener('click', () => {
            const hiddenReviews = document.querySelectorAll('.hidden-review');
            let isHidden = false;

            hiddenReviews.forEach(review => {
                if (review.style.display === 'none') {
                    review.style.display = 'flex'; // Use flex pattern from .review-card
                    isHidden = true;
                } else {
                    review.style.display = 'none';
                }
            });

            if (isHidden) {
                viewMoreReviewsBtn.textContent = 'View Less';
            } else {
                viewMoreReviewsBtn.textContent = 'View More Reviews';
            }
        });
    }

    // ==========================================
    // Gallery Filter & Lightbox Logic
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            // Re-calculate visible items for lightbox navigation
            updateVisibleItems();
        });
    });

    // Lightbox Logic
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxPrice = document.getElementById('lightbox-price');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxOrderBtn = document.getElementById('lightbox-order-btn');
    const lightboxWaBtn = document.getElementById('lightbox-wa-btn');

    let visibleItems = Array.from(galleryItems);
    let currentIndex = 0;

    function updateVisibleItems() {
        visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
    }

    // Initialize visible items
    updateVisibleItems();

    function openLightbox(index) {
        if (!lightbox) return;
        currentIndex = index;
        const item = visibleItems[currentIndex];

        // Populate data
        const imgSrc = item.querySelector('img').src;
        const title = item.getAttribute('data-title');
        const price = item.getAttribute('data-price');
        const desc = item.getAttribute('data-desc');

        lightboxImg.src = imgSrc;
        lightboxTitle.textContent = title;
        lightboxPrice.textContent = 'Starting at ₹' + price;
        lightboxDesc.textContent = desc;

        // WhatsApp Link formulation
        const waMessage = `Hi SS Magic Printers, I am interested in ordering the '${title}' (Starting at ₹${price}). Can you share more details?`;
        if (lightboxWaBtn) {
            lightboxWaBtn.href = `https://wa.me/917731879736?text=${encodeURIComponent(waMessage)}`;
        }

        // Order Now Link (opens the custom order modal)
        if (lightboxOrderBtn) {
            lightboxOrderBtn.onclick = () => {
                closeLightbox();
                const productSelect = document.getElementById('product');
                if (productSelect) productSelect.value = title;
                const orderModal = document.getElementById('order-modal');
                if (orderModal) orderModal.classList.add('show');
                document.body.classList.add('no-scroll');
            };
        }

        lightbox.classList.remove('hidden');
        document.body.classList.add('no-scroll');
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        // Clear src to prevent flash of old image on next open
        setTimeout(() => lightboxImg.src = '', 300);
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % visibleItems.length;
        openLightbox(currentIndex);
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        openLightbox(currentIndex);
    }

    // Attach click events to gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = visibleItems.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    if (lightbox) {
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxNext) lightboxNext.addEventListener('click', showNext);
        if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

        // Close on overlay click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-image-container')) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('hidden')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });
    }

    // ==========================================
    // Amazon-Style Product Modal Logic
    // ==========================================
    const amazonModal = document.getElementById('amazon-product-modal');
    const amazonModalClose = document.getElementById('amazon-modal-close');
    const amazonModalImg = document.getElementById('amazon-modal-img');
    const amazonModalTitle = document.getElementById('amazon-modal-title');
    const amazonModalPrice = document.getElementById('amazon-modal-price');
    const amazonModalOrderBtn = document.getElementById('amazon-modal-order-btn');
    const amazonModalWaBtn = document.getElementById('amazon-modal-wa-btn');

    if (amazonModal) {
        // Use generic selector to work across different sections
        const productCards = document.querySelectorAll('.ecommerce-products-grid .product-card');
        
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const img = card.querySelector('.product-img');
                const title = card.querySelector('.product-title');
                const priceElem = card.querySelector('.product-price');
                const waLink = card.querySelector('.product-order-btn');
                
                if (img) amazonModalImg.src = img.src;
                if (title) {
                    amazonModalTitle.textContent = title.textContent;
                    if (typeof loadReviews === 'function') loadReviews(title.textContent);
                }
                if (priceElem) {
                    // product-price usually contains "₹599", remove ₹ for the Amazon price display
                    amazonModalPrice.textContent = priceElem.textContent.replace('₹', '');
                }
                
                if (waLink) {
                    amazonModalWaBtn.href = waLink.href;
                }
                
                if (amazonModalOrderBtn && title) {
                    amazonModalOrderBtn.onclick = () => {
                        amazonModal.classList.remove('show');
                        document.body.style.overflow = '';
                        // Wait for transition before opening the main order modal
                        setTimeout(() => openOrderModal(title.textContent), 300);
                    };
                }

                amazonModal.classList.remove('hidden');
                // Slight delay for CSS opacity transition to trigger
                setTimeout(() => {
                    amazonModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }, 10);
            });
        });

        // Close logic
        function closeAmazonModal() {
            amazonModal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                amazonModal.classList.add('hidden');
            }, 300);
        }

        if (amazonModalClose) {
            amazonModalClose.addEventListener('click', closeAmazonModal);
        }

        amazonModal.addEventListener('click', (e) => {
            if (e.target === amazonModal || e.target.classList.contains('amazon-modal-img-container')) {
                closeAmazonModal();
            }
        });

        // Reviews Logic
        const defaultReviews = {
            "Love Collage Frame": [
                {reviewer_name: "Ramesh Reddy", rating: 5, review_text: "Beautiful design and great quality!"},
                {reviewer_name: "Sneha", rating: 4, review_text: "Loved it, my partner was very happy."}
            ]
        };

        const reviewsListContainer = document.getElementById('product-reviews-list');
        const addReviewForm = document.getElementById('add-review-form');

        async function getReviews(productName) {
            if (!supabase) {
                console.warn("Supabase not initialized. Using local defaults.");
                return defaultReviews[productName] || [{reviewer_name: "Customer", rating: 5, review_text: "Excellent product, highly recommended!"}];
            }

            const { data, error } = await supabase
                .from('product_reviews')
                .select('*')
                .eq('product_name', productName)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching reviews:", error);
                return [];
            }
            return data;
        }

        function renderStars(rating) {
            let stars = '';
            for(let i=1; i<=5; i++) {
                if(i <= rating) stars += '<i class="ph-fill ph-star"></i>';
                else stars += '<i class="ph-bold ph-star" style="opacity: 0.2;"></i>';
            }
            return stars;
        }

        window.loadReviews = async function(productName) {
            if(!reviewsListContainer) return;
            reviewsListContainer.innerHTML = '<p style="text-align: center; color: var(--clr-text-light);">Loading reviews...</p>';
            
            const reviews = await getReviews(productName);
            reviewsListContainer.innerHTML = '';
            
            // Populate Collective Customer Photos Gallery
            const photosGallery = document.getElementById('customer-photos-gallery');
            const photosList = document.getElementById('customer-photos-list');
            if (photosGallery && photosList) {
                const allImages = reviews.flatMap(r => r.images || []);
                if (allImages.length > 0) {
                    photosGallery.style.display = 'block';
                    photosList.innerHTML = allImages.map(img => `
                        <img src="${img}" class="review-img" onclick="window.open(this.src, '_blank')">
                    `).join('');
                } else {
                    photosGallery.style.display = 'none';
                }
            }

            if (reviews.length === 0) {
                reviewsListContainer.innerHTML = '<p style="color: var(--clr-text-light); font-size: 0.95rem;">No reviews yet. Be the first to review!</p>';
                return;
            }

            reviews.forEach(r => {
                reviewsListContainer.innerHTML += `
                    <div class="review-item">
                        <div class="review-user">
                            <div class="user-avatar">
                                ${r.reviewer_name.charAt(0).toUpperCase()}
                            </div>
                            <div class="user-info">
                                <h5>${r.reviewer_name}</h5>
                                <div class="review-rating">${renderStars(r.rating)}</div>
                            </div>
                        </div>
                        <p class="review-text">${r.review_text}</p>
                        ${r.images && r.images.length > 0 ? `
                            <div class="review-images">
                                ${r.images.map(img => `<img src="${img}" class="review-img" onclick="window.open(this.src, '_blank')">`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        };

        if(addReviewForm) {
            const reviewImagesInput = document.getElementById('review-images');
            const reviewImagePreview = document.getElementById('review-image-preview');
            const submitBtn = document.getElementById('submit-review-btn');
            let selectedFiles = [];

            if (reviewImagesInput) {
                reviewImagesInput.addEventListener('change', (e) => {
                    selectedFiles = Array.from(e.target.files).slice(0, 4);
                    if (reviewImagePreview) {
                        reviewImagePreview.innerHTML = '';
                        selectedFiles.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                reviewImagePreview.innerHTML += `
                                    <div style="position: relative;">
                                        <img src="${event.target.result}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 10px; border: 1px solid #e2e8f0;">
                                    </div>`;
                            };
                            reader.readAsDataURL(file);
                        });
                    }
                });
            }

            addReviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!supabase) {
                    alert("Please set up your Supabase API keys in script.js to submit reviews.");
                    return;
                }

                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Submitting...';
                submitBtn.disabled = true;

                const productName = amazonModalTitle.textContent;
                const name = document.getElementById('review-name').value;
                const rating = parseInt(document.getElementById('review-rating').value);
                const text = document.getElementById('review-text').value;

                try {
                    const imageUrls = [];
                    // Upload Images to Supabase Storage
                    for (const file of selectedFiles) {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                        const filePath = `${productName.replace(/[^a-zA-Z0-9]/g, '_')}/${fileName}`;

                        console.log("Uploading file to:", filePath);
                        const { error: uploadError } = await supabase.storage
                            .from('review-images')
                            .upload(filePath, file);

                        if (uploadError) {
                            console.error("Upload error for file:", file.name, uploadError);
                            continue;
                        }

                        const { data: { publicUrl } } = supabase.storage
                            .from('review-images')
                            .getPublicUrl(filePath);
                        imageUrls.push(publicUrl);
                    }

                    // Insert Review into Database
                    const { error: insertError } = await supabase
                        .from('product_reviews')
                        .insert([{
                            product_name: productName,
                            reviewer_name: name,
                            rating: rating,
                            review_text: text,
                            images: imageUrls
                        }]);

                    if (insertError) throw insertError;

                    alert("Review submitted successfully! It is now visible to all customers.");
                    addReviewForm.reset();
                    if (reviewImagePreview) reviewImagePreview.innerHTML = '';
                    selectedFiles = [];
                    window.loadReviews(productName);

                } catch (err) {
                    console.error("Submission error:", err);
                    alert("Failed to submit review: " + (err.message || "Unknown error"));
                } finally {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
    // ==========================================
    // Categorized Product Browser
    // ==========================================
    const catalogFilterButtons = document.getElementById('catalog-filter-buttons');
    const catalogProductGrid = document.getElementById('catalog-product-grid');

    // catalogData will be filled from catalog-manifest.json
    let catalogData = [];

    // ==========================================
    // UNIFIED PRODUCT REGISTRY (MANUAL DICTIONARIES)
    // You can easily modify any product's Name or Price here!
    // ==========================================

    const GLOBAL_PRODUCT_NAMES = {
        // ==========================================
        // Photo Frames (photo-frames)
        // ==========================================
        '5': 'Premium Square Photo Frame (8x12)',
        'whatsapp image 2026-05-24 at 11.37.19 am': 'Collage Photo Frame (12x15)',
        'whatsapp image 2026-05-24 at 11.37.20 am m': 'Artistic Designer Frame (6x8)',
        'whatsapp image 2026-05-24 at 11.37.20 am': 'Family Collage Photo Frame (8x12)',
        'whatsapp image 2026-05-24 at 11.37.20 amr': 'Love & Family Photo Collage (12x18)',
        'whatsapp image 2026-05-24 at 11.37.21 am4': 'Premium Border Photo Frame (12x20)',
        '04_a_heart_shaped_photo_collage_with_two_people_in_it': 'Heart Shaped Collage Two (16x24)',
        '29_three_photos_with_the_words_best_moment_on_them_are_placed_in_front_of_a_yellow_background': 'Three Photos Words Best (24x36)',
        '01_a_child_s_birthday_card_with_photos_of_her_and_the_date_in_which_she_was_born': 'Child Birthday Card Photos (24x36)',
        '22_a_child_with_many_pictures_on_it_and_the_words_happy_birthday_written_in_different_languages': 'Child Pictures Words Happy (12x24)',
        '25_a_family_tree_with_hearts_and_stars_in_the_background_on_a_black_background_that_says_happy_birthday': 'Family Tree Hearts Stars (12x36)',
        '11_a_black_and_white_photo_frame_with_pictures_of_people_on_it_including_a_butterfly': 'Frame Pictures People Including (12x8)',
        '20_an_abstract_black_and_white_background_with_three_square_frames_in_the_shape_of_a_heart': 'Abstract Three Square Frames (12x8)',
        '24_two_polaroid_frames_with_a_red_push_button_on_them_against_a_white_background': 'Two Polaroid Frames Red (12x8)',
        '03_a_flyer_for_a_photo_shoot_with_photoshopped_images_on_it_and_flowers_in_the_background': 'Flyer Shoot Photoshopped Images (12x8)',
        '05_an_advertisement_for_valentine_s_day_with_photos_and_text_on_the_front_in_black_frame': 'Advertisement Valentine Day Photos (12x8)',
        '06_two_black_frames_with_flowers_and_leaves_on_them': 'Two Frames Flowers Leaves (12x8)',
        '15_the_flyer_for_an_event_with_pictures_of_women_in_red_dresses_and_flowers_on_it': 'Flyer Event Pictures Women (12x30)',
        '37_the_couple_is_holding_each_other_s_hand_and_posing_for_pictures_in_front_of_them': 'Couple Holding Each Other (12x8)',
        '14_an_old_photo_of_a_man_sitting_on_the_floor_with_his_hands_behind_his_head': 'Old Man Sitting Floor (12x8)',
        '16_four_different_movie_posters_are_shown_together': 'Four Different Movie Posters (12x8)',
        '17_a_woman_in_a_blue_sari_standing_next_to_a_red_wheel_with_photos_on_it': 'Woman Blue Sari Standing (12x8)',
        '18_three_square_frames_with_hearts_on_them_against_a_red_background': 'Three Square Frames Hearts (12x8)',
        '31_an_open_photo_frame_with_yellow_paper_clippings_on_the_top_and_bottom_corner': 'Open Frame Yellow Paper (12x8)',
        '33_the_poster_for_maddavi_murthh': 'Poster Maddavi Murthh (12x8)',
        '34_an_image_of_a_white_phone_with_hearts_on_the_front_and_back_side_against_a_gray_background': 'Phone Hearts Against (12x8)',
        '35_an_empty_black_frame_on_a_white_background_with_no_image_or_text_in_the_bottom_corner': 'Empty Frame No Or (12x8)',
        '02_an_ornate_gold_frame_on_a_white_background': 'Ornate Gold Frame (12x8)',
        '12_an_ornate_gold_frame_on_a_transparent_background': 'Ornate Gold Frame (12x8)',
        '13_an_ornate_gold_frame_with_a_white_background_and_golden_trimmings_on_the_edges': 'Ornate Gold Frame Golden (12x8)',
        '23_an_empty_gold_frame_hanging_on_the_wall_in_front_of_a_white_wall_and_floor': 'Empty Gold Frame Hanging (12x8)',
        '21_an_empty_frame_hanging_on_the_wall_next_to_a_chair_with_a_plant_in_it': 'Empty Frame Hanging Wall (12x8)',
        '39_a_white_and_black_photo_frame_on_a_gray_background': 'Frame (12x8)',
        '10_an_empty_polaroid_frame_with_some_tape_on_it': 'Empty Polaroid Frame Tape (12x8)',
        // ==========================================
        // Magic Pillows (magic-pillows)
        // ==========================================
        '01_silver_sequin_personalized_magic_pillow': 'Silver Sequin Personalized Magic',
        '02_sequin_magic_cushion_photo_printed': 'Sequin Magic Cushion Printed',
        '03_magic_pillow_with_photo_magical_photo': 'Magic Pillow Magical',
        '04_personalized_photo_magical_magic_black_pillow': 'Personalized Magical Magic Pillow',
        '05_buy_amazing_magic_pillow_with_photo': 'Buy Amazing Magic Pillow',
        '06_magic_pillow_paridhi_international': 'Magic Pillow Paridhi International',
        '07_personalized_photo_printed_pillow': 'Personalized Printed Pillow',
        '08_magic_pillow_surprise_in_every_flip': 'Magic Pillow Surprise Every',
        '09_personalised_magic_sequin_cushion': 'Personalised Magic Sequin Cushion',
        '10_personalised_magical_sequin_cushion': 'Personalised Magical Sequin Cushion',
        '11_rani_pink_magical_wings_pillow_covers': 'Rani Pink Magical Wings',
        '12_magical_unicorn_decorative_pillow': 'Magical Unicorn Decorative Pillow',
        '13_magic_pillow_with_photo_heart': 'Magic Pillow Heart',
        '14_magic_pillow_at_instagram': 'Magic Pillow Instagram',
        '15_magical_rainbows_quilted_pillow': 'Magical Rainbows Quilted Pillow',
        '16_unicorn_pillow_unicorn_cushions': 'Unicorn Pillow Unicorn Cushions',
        '17_buy_amazing_magic_pillow_with_photo_2': 'Buy Amazing Magic Pillow',
        '18_personalized_photo_magical_magic_pillow_2': 'Personalized Magical Magic Pillow',
        '19_magic_pillow_photo_printed_pillow': 'Magic Pillow Printed Pillow',
        '20_magic_sequin_cushion': 'Magic Sequin Cushion',
        // ==========================================
        // Normal Pillows (normal-pillows-heart)
        // ==========================================
        '51pxnjzyu6l': 'Romantic Red Heart pillow ',
        '61abkpfwrzl-550': 'Sequin blue Heart pillow',
        '61ognup7sal': 'Personalized Heart Photo Pillow',
        '71a+ls9vapl': 'Premium pink Heart Shape pillow ',
        'heart-shape-printed-red-sublimation-fur-cushion-650': 'Red  Heart dual photo pillow',
        'whatsapp image 2026-05-24 at 12.00.51 pm': 'Small Personalized Square Pillow',
        'whatsapp image 2026-05-24 at 12.00.52 pm': 'Small Personalized Heart Pillow ',
        // ==========================================
        // LED Pillows (led-pillows)
        // ==========================================
        'heart led pillow 650': 'Heart Shape LED Personalized Pillow',
        'led-cushion-500x500-650': 'Premium LED Photo pillow',
        'square pillow with led pillow 650': 'Square LED Photo pillow',
        'whatsapp image 2026-05-24 at': 'LED Personalized pillow',
        'whatsapp image 2026-05-24 at 11.45.05 am': 'LED Personalized Heart  pillow',
        'whatsapp image 2026-05-24 at 11.45.06 am': 'LED Personalized Heart  pillow',
        'yellow-led-sublimation-cushion-500x500': 'Yellow Sublimation Heart LED pillow',
        // ==========================================
        // Mug Items (mugs)
        // ==========================================
        '2': 'Premium Dual-Side Custom Mug',
        'whatsapp image 2026-05-24 at 11.59.16 am': 'Personalized Magic Photo Mug',
        'whatsapp image 2026-05-24 at 450': 'Customized Couples Photo Mug',
        'colour handlee -300': 'Color Handle Ceramic Mug',
        'heart handle magic cup -550': 'Heart Handle Magic Mug',
        'personalised-heart-handle-coffee-mug-350': 'Personalized Heart Handle Mug',
        'product-350': 'Custom Printed Ceramic Mug',
        'product-jpeg 350': 'Artisan Designer Mug',
        'sublimation-mugs-printing-300': 'Premium Sublimation Mug',
        'white-mug-heart-handle-printing- 350': 'White Heart Handle Mug',
        // ==========================================
        // Wooden Lamps (wooden-lamps)
        // ==========================================
        'whatsapp image 2026-05-24 at 5.29.11 pm (1)': 'Romantic Couple Silhouette LED Lamp',
        'whatsapp image 2026-05-24 at 5.29.11 pm': 'Creative Circular Photo Projection Lamp',
        'whatsapp image 2026-05-24 at 5.29.12 pm': 'Luxury Ambient Photo Frame Glow Lamp',
        'whatsapp image 2026-05-24 at 5.29.13 pm': 'Bespoke Anniversary Silhouette Night Light',
        'whatsapp image 2026-05-24 at 4.54.14 pm2222222222222222': 'Premium Floating LED Hexagonal Lamp',
        'whatsapp image 2026-05-24 at 4.54.15 pm33333333333': 'Executive Custom  Photo Light',
        'whatsapp image 2026-05-24 at 4.54.16 pm666666': 'Executive Custom  Photo Light',
        'whatsapp image 2026-05-24 at 4.54.16 pm888888': 'Romantic Multiphoto Lamp',
        'whatsapp image 2026-05-24 at 4.54.16 pm9999': 'Romantic Multiphoto Lamp',
        'whatsapp image 2026-05-24 at 4.54.17 pm7777777777': 'Luxury Heart Photo Light',
        'custom-led-lamp-11': 'Small Heart Magic Mirror',
        'custom-led-lamp-22': 'Night Lamp',
        'custom-led-lamp-33': 'Small Rotating Lamp',
        'whatsapp image 2026-05-24 at 4.40.12 pm': 'Premium Personalized Square Photo Lamp',
        'whatsapp image 2026-05-24 at 10.45.03 am': 'Multi Colour Rotating Lamp',
        'whatsapp image 2026-05-24 at 10.45.03 am555': 'Multi Colour Rotating Lamp',
        'whatsapp image 2026-05-24 at 10.45.03 am666666': 'Night Frame Lamp',
        'whatsapp image 2026-05-24 at 10.45.02 am': 'Premium LED Heart Lamp',
        'whatsapp image 2026-05-24 at 10.45.02 am2': 'Premium Custom Photo Lamp',
        'whatsapp image 2026-05-24 at 10.45.05 am3': 'Romantic Heart Silhouette LED Lamp',
        'whatsapp image 2026-05-24 at 10.45.06 am33': 'Creative Customized Silhouette Night Light',
        'whatsapp image 2026-05-24 at 10.45.07 am333': 'Heart Magic Mirror ',
        'whatsapp image 2026-05-24 at 10.45.07 am6': 'Premium Multiphoto Revolving LED Lamp',
        'whatsapp image 2026-05-24 at 10.45.08 am9': 'Round Magic Mirror ',
        'whatsapp image 2026-05-24 at 10.45.08 am99': 'Small Round Magic Mirror',
        'whatsapp image 2026-05-24 at 10.45.09 am6': 'Big Square Rotating Lamp ',
        'whatsapp image 2026-05-24 at 10.45.09 am7': 'Big Square Rotating Lamp ',
        'whatsapp image 2026-05-24 at 10.45.09 am9': 'Globe Rotating Lamp',
        'whatsapp image 2026-05-24 at 10.45.10 am4': 'Small Square Photo Lamp',
        // ==========================================
        // Premium Keychains (keychains)
        // ==========================================
        '61lujmamh2l-350': 'Premium Rotating Photo Keychain',
        '61n1uryazgl-200': 'Custom Acrylic Heart Keychain',
        '71siksr3iwl-100': 'Standard Single-Side Keychain',
        'metal marking 200': 'Laser Marked Metal Keychain',
        'personalised_black_metal_name_keychain': 'Personalized Matte Black Metal Keychain',
        // ==========================================
        // T-Shirts & Wearables (tshirts)
        // ==========================================
        '01_young_man_printing_on_t_shirt_at_workshop': 'Custom Workshop Printed Tee',
        '05_white_t_shirt_with_palm_tree_print': 'Palm Tree Printed Casual Tee',
        '06_t_shirt_printing_machine_innovation_shirt_and_textile_printer_production': 'Premium Custom Brand Tee',
        '510in0gaaxl._ux679_': 'Solid Crew Neck Casual Tee',
        '51h7s27ib2l': 'Classic Fit Sublimation Tee',
        'h7fc5ec33914b4a71bccdf281f3f262a4r.jpg_300x300': 'Sleek Fit Graphic Tee',
        'men-sublimation-t-shirt-500x500': 'Men Premium Sublimation T-Shirt',
        'short-sleeves-plain-sublimation-white-collar-t-shirts-387': 'Short-Sleeves Sublimation Collar Tee',
        'tshirt-1': 'Premium Customized Graphic Tee',
        'tshirt-1111': 'Classic White Sublimation Tee',
        'tshirt-2': 'Bespoke Custom Photo Tee',
        'tshirt-3': 'Artistic Sublimation Design Tee',
        'tshirt-4': 'Premium Casual White Custom Tee',
        'tshirt-5': 'Comfort Fit Printed Tee',
        'tshirt-6': 'Graphic Sublimation Sports Tee',
        'tshirt-7': 'Custom Logo Athletic Tee',
        'whatsapp image 2026-05-24 at 4.55.41 pm': 'Bespoke Couple Customized Tee',
        'whatsapp image 2026-05-24 at 4.55.42 pm (1)': 'Personalized Graphic Crew Neck Tee',
        'whatsapp image 2026-05-24 at 4.55.42 pm': 'Customized Typography Photo Tee',
        'whatsapp image 2026-05-24 at 4.55.43 pm (1)': 'Executive Custom Corporate Branding Tee',
        'whatsapp image 2026-05-24 at 4.55.43 pm (2)': 'Bespoke Anniversary Photo Tee',
        'whatsapp image 2026-05-24 at 4.55.43 pm': 'Premium Custom Logo Print Tee',
        'whatsapp image 2026-05-24 at 4.55.44 pm (1)': 'Personalized Heavy Cotton Tee',
        'whatsapp image 2026-05-24 at 4.55.44 pm (2)': 'Customized Family Reunion Tee',
        'whatsapp image 2026-05-24 at 4.55.44 pm': 'Bespoke Digital Art Sublimation Tee',
        'whatsapp image 2026-05-24 at 4.55.45 pm': 'Premium Custom Birthday Theme Tee',
        'whatsapp image 2026-05-24 at 4.55.46 pm (1)': 'Personalized High-Performance Sports Tee',
        'whatsapp image 2026-05-24 at 4.55.46 pm': 'Customized Portrait Memorial Tee',
        'whatsapp image 2026-05-24 at 4.56.14 pm': 'Bespoke Modern Minimalist Logo Tee',
        'whatsapp image 2026-05-24 at 4.56.38 pm': 'Premium Soft-Touch Printed Tee',
        'whatsapp image 2026-05-24 at 4.57.12 pm': 'Customized Full-Width Graphic Tee',
        'whatsapp image 2026-05-24 at 4.58.18 pm': 'Personalized Vintage Sublimation Tee',
        'whatsapp image 2026-05-24 at 4.58.55 pm': 'Bespoke Retro Style Custom Tee',
        'whatsapp image 2026-05-24 at 4.59.16 pm': 'Premium Activewear Customized Tee',
        'whatsapp image 2026-05-24 at 4.59.36 pm': 'Customized Team Logo Athletics Tee',
        'whatsapp image 2026-05-24 at 5.00.09 pm': 'Personalized Sleek Urban Wear Tee',
        'whatsapp image 2026-05-24 at 5.00.10 pm': 'Bespoke Custom Statement Print Tee',
        // ==========================================
        // Wall Clocks (wall-clocks)
        // ==========================================
        'whatsapp image 2026-05-24 at 5.51.44 pm (1)': 'Premium Heart Silhouette Photo Clock',
        'whatsapp image 2026-05-24 at 5.51.44 pm': 'Bespoke Romantic Couple Wall Clock',
        'whatsapp image 2026-05-24 at 5.51.45 pm (1)': 'Luxury Multi-Photo Collage Wall Clock',
        'whatsapp image 2026-05-24 at 5.51.45 pm': 'Classic Wooden Finish Photo Clock',
        'whatsapp image 2026-05-24 at 5.51.46 pm': 'Creative Family Memories Collage Clock',
        'whatsapp image 2026-05-24 at 5.51.47 pm (1)': 'Royal Glass Finish Custom Photo Clock',
        'whatsapp image 2026-05-24 at 5.51.47 pm (2)': 'Executive Square Personalized Wall Clock',
        'whatsapp image 2026-05-24 at 5.51.47 pm': 'Modern Geometric Custom Wall Clock',
        'whatsapp image 2026-05-24 at 5.51.48 pm': 'Vintage Roman Dial Customized Photo Clock',
        'download (1)': 'Custom Heart Shape Photo Clock',
        'download (2)': 'Premium Oval Photo Clock',
        'download (3)': 'Circular Collage Photo Clock',
        'download (4)': 'Classic Square Photo Clock',
        'download (5)': 'Royal Ship Wheel Photo Clock',
        'download': 'Elegant Round Photo Clock',
        'wall-clock-custom': 'Elegant Round Custom Photo Clock',
        // ==========================================
        // Personalized Bottles (bottles)
        // ==========================================
        '71zowrhaw8l. 500ml  350': 'Premium Personalized Sports Bottle (500 ml)',
        'black with logo 650': 'Custom Logo Matte Black Bottle (1000 ml)',
        'bottle-ok': 'Artisan Stainless Steel Bottle (750 ml)',
        'download  750 ml 450': 'Insulated Thermos Flask Bottle (1000 ml)',
        'images  750': 'Sleek White Personalized Bottle (1000 ml)',
        'images (1)': 'Custom Graphic Steel Bottle (500 ml)',
        'images (10) 499': 'Vacuum Insulated Travel Mug (1000 ml)',
        'images (2)': 'Minimalist Photo Printed Bottle (750 ml)',
        'images (4) 750': 'Classic White Sports Bottle (1000 ml)',
        'images (5)': 'Double-Wall Insulated Bottle (1000 ml)',
        'images (6)': 'Active Hydration Sports Bottle (500 ml)',
        'images (7) 650': 'Premium Matte Black Flask (1000 ml)',
        'images (8)': 'Artistic Personalized Bottle (1000 ml)',
        'images (9)': 'Standard Steel Travel Flask (1000 ml)',
        'images': 'Sleek White Personalized Bottle (750 ml)',
        'silver with logo 650': 'Custom Logo Sleek Silver Bottle (1000 ml)',
        // ==========================================
        // Customized Pens (pens)
        // ==========================================
        'custom-gift-pen': 'Personalized Executive Signature Pen',
        'whatsapp image 2026-05-24 at 4.06.02 pm 44': 'Custom Name-Engraved Metal Pen',
        'whatsapp image 2026-05-24 at 4.06.03 pm55': 'Personalized Sleek Metallic Pen',
        'whatsapp image 2026-05-24 at 4.07.28 pm55': 'Custom Silver-Trimmed Executive Pen',
        'whatsapp image 2026-05-24 at 4.08.19 pm66': 'Premium Gold-Accent Engraved Pen',
        'whatsapp image 2026-05-24 at 4.09.08 pm555555': 'Eco Bamboo Personalized Logo Pen',
        'whatsapp image 2026-05-24 at 4.10.34 pm666': 'Luxury Gift Pen with Custom Name',
        'matte-black-engraved-pen': 'Premium Matte Black Engraved Pen',
        'royal-gold-rollerball-pen': 'Royal Gold Rollerball Pen',
        'bamboo-engraved-pen': 'Eco-Friendly Bamboo Engraved Pen',
        'carbon-fiber-gift-pen': 'Luxury Carbon Fiber Pen (with Box)',
        // ==========================================
        // Devotional God Frames (god-frames)
        // ==========================================
        'whatsapp image 2026-05-24 at 5.52.19 pm': 'Premium Devotional Gold-Bordered Frame',
        'whatsapp image 2026-05-24 at 5.52.20 pm (1)': 'Divine Grace Customized Acrylic Frame',
        'whatsapp image 2026-05-24 at 5.52.20 pm (2)': 'Sacred Blessings Wooden Carver Frame',
        'whatsapp image 2026-05-24 at 5.52.20 pm': 'Spiritual MDF Textured Frame',
        'whatsapp image 2026-05-24 at 5.52.21 pm (1)': 'Aura of Peace Luxury Glass Frame',
        'whatsapp image 2026-05-24 at 5.52.21 pm': 'Devotional Glow Acrylic LED Frame',
        'whatsapp image 2026-05-24 at 5.52.22 pm (1)': 'Infinite Blessings Royal Gold Frame',
        'whatsapp image 2026-05-24 at 5.52.22 pm': 'Divine Splendor Premium Bordered Frame',
        // ==========================================
        // Premium Devotional Statues (statues)
        // ==========================================
        'whatsapp image 2026-05-24 at 6.05.51 pm (1)': 'Bespoke Brass Ganesha Statue',
        'whatsapp image 2026-05-24 at 6.05.51 pm (2)': 'Divine Radha Krishna Marble Finish Idol',
        'whatsapp image 2026-05-24 at 6.05.51 pm': 'Premium Meditating Buddha Zen Statue',
        'whatsapp image 2026-05-24 at 6.05.52 pm (1)': 'Elegant Lord Shiva Adiyogi Figurine',
        'whatsapp image 2026-05-24 at 6.05.52 pm': 'Sacred Panchmukhi Hanuman Brass Idol',
        'whatsapp image 2026-05-24 at 6.05.55 pm': 'Spiritual Blessing Ganesha Resin Statue',
        'whatsapp image 2026-05-24 at 6.05.56 pm (1)': 'Luxury Gold-Plated Lakshmi Ganesha Set',
        'whatsapp image 2026-05-24 at 6.05.56 pm': 'Divine Lord Krishna Flute Playing Idol',
        'whatsapp image 2026-05-24 at 6.05.57 pm (1)': 'Premium Marble Dust Hanuman Statue',
        'whatsapp image 2026-05-24 at 6.05.57 pm (2)': 'Sacred Lord Shiva Family Figurine',
        'whatsapp image 2026-05-24 at 6.05.57 pm': 'Spiritual White Marble Buddha Statue',
        'whatsapp image 2026-05-24 at 6.05.58 pm (1)': 'Bespoke Antique Finish Ganesha Idol',
        'whatsapp image 2026-05-24 at 6.05.58 pm (2)': 'Elegant Sitting Hanuman Devotional Statue',
        'whatsapp image 2026-05-24 at 6.05.58 pm': 'Spiritual Nataraja Brass Dancing Statue',
        'whatsapp image 2026-05-24 at 6.05.59 pm (1)': 'Luxury Gold-Accent Radha Krishna Idol',
        'whatsapp image 2026-05-24 at 6.05.59 pm': 'Premium Handcrafted Lord Shiva Meditating Statue',
        'whatsapp image 2026-05-24 at 6.06.00 pm (1)': 'Sacred Blessing Ganesha Terracotta Idol',
        'whatsapp image 2026-05-24 at 6.06.00 pm (2)': 'Divine Lord Krishna Playing Flute Brass Statue',
        'whatsapp image 2026-05-24 at 6.06.00 pm': 'Spiritual Meditating Buddha Obsidian Finish',
        'whatsapp image 2026-05-24 at 6.14.26 pm (1)': 'Bespoke Antique Ganesha Sitting Idol',
        'whatsapp image 2026-05-24 at 6.14.26 pm': 'Divine Radha Krishna Eternal Love Statue',
        'whatsapp image 2026-05-24 at 6.14.27 pm': 'Premium Lord Shiva Adiyogi Silhouette Idol',
        'whatsapp image 2026-05-24 at 6.14.28 pm (1)': 'Spiritual Panchmukhi Hanuman Carver Statue',
        'whatsapp image 2026-05-24 at 6.14.28 pm': 'Sacred Blessing Ganesha Velvet Finish Idol',
        'whatsapp image 2026-05-24 at 6.14.30 pm (1)': 'Luxury Gold-Plated Lakshmi Idol',
        'whatsapp image 2026-05-24 at 6.14.30 pm (2)': 'Divine Lord Krishna Butter Thief Statue',
        'whatsapp image 2026-05-24 at 6.14.30 pm (3)': 'Premium Marble Dust Hanuman Blessings Idol',
        'whatsapp image 2026-05-24 at 6.14.30 pm': 'Sacred Lord Shiva Family Brass Figurine',
        'whatsapp image 2026-05-24 at 6.14.31 pm (1)': 'Spiritual White Marble Buddha Meditating Statue',
        'whatsapp image 2026-05-24 at 6.14.31 pm (2)': 'Bespoke Antique Finish Ganesha Dancing Idol',
        'whatsapp image 2026-05-24 at 6.14.31 pm (3)': 'Elegant Sitting Hanuman Devotional Figurine',
        'whatsapp image 2026-05-24 at 6.14.31 pm': 'Spiritual Nataraja Bronze Dancing Statue',
        'whatsapp image 2026-05-24 at 6.14.32 pm': 'Luxury Gold-Accent Radha Krishna Divine Idol',
        // ==========================================
        // Premium Indoor Water Fountains (waterfountain)
        // ==========================================
        'whatsapp image 2026-05-24 at 8.11.05 pm': 'Bespoke Tabletop Zen Water Fountain',
        'whatsapp image 2026-05-24 at 8.11.06 pm (1)': 'Spiritual Ganesha Indoor Water Fountain',
        'whatsapp image 2026-05-24 at 8.11.06 pm (2)': 'Premium LED Lit Cascade Water Fountain',
        'whatsapp image 2026-05-24 at 8.11.06 pm (3)': 'Sacred Lord Shiva Rockfall Water Fountain',
        'whatsapp image 2026-05-24 at 8.11.06 pm': 'Divine Radha Krishna Fountain of Love',
        'whatsapp image 2026-05-24 at 8.15.58 pm': 'Spiritual Meditating Buddha Water Fountain',
        'whatsapp image 2026-05-24 at 8.15.59 pm (1)': 'Luxury Tabletop Aura Water Fountain',
        'whatsapp image 2026-05-24 at 8.15.59 pm (2)': 'Bespoke Artistic Hand-Carved Water Fountain',
        'whatsapp image 2026-05-24 at 8.15.59 pm (3)': 'Premium Relaxing Indoor Waterfall Fountain',
        'whatsapp image 2026-05-24 at 8.15.59 pm': 'Sacred Ganesha Lotus Base Water Fountain',
        // ==========================================
        // Customized Premium Wallets (wallet)
        // ==========================================
        'whatsapp image 2026-05-24 at 8.24.27 pm (1)': 'Bespoke Classic Leather Men Wallet',
        'whatsapp image 2026-05-24 at 8.24.27 pm': 'Premium Custom Name-Engraved Wallet',
        'whatsapp image 2026-05-24 at 8.24.28 pm (1)': 'Luxury Slim Bi-Fold Personalized Wallet',
        'whatsapp image 2026-05-24 at 8.24.28 pm (2)': 'Executive Personalized Leather Wallet',
        'whatsapp image 2026-05-24 at 8.24.28 pm': 'Bespoke Multi-Card Premium Wallet',
        'whatsapp image 2026-05-24 at 8.24.29 pm (1)': 'Divine Blessings Custom Photo Wallet',
        'whatsapp image 2026-05-24 at 8.24.29 pm': 'Spiritual Monogram Engraved Wallet',



    };

    const GLOBAL_PRODUCT_PRICES = {
        // ==========================================
        // Photo Frames (photo-frames)
        // ==========================================
        '5': '₹650',
        'whatsapp image 2026-05-24 at 11.37.19 am': '₹1050',
        'whatsapp image 2026-05-24 at 11.37.20 am m': '₹450',
        'whatsapp image 2026-05-24 at 11.37.20 am': '₹650',
        'whatsapp image 2026-05-24 at 11.37.20 amr': '₹1250',
        'whatsapp image 2026-05-24 at 11.37.21 am4': '₹1450',
        '04_a_heart_shaped_photo_collage_with_two_people_in_it': '₹2500',
        '29_three_photos_with_the_words_best_moment_on_them_are_placed_in_front_of_a_yellow_background': '₹3500',
        '01_a_child_s_birthday_card_with_photos_of_her_and_the_date_in_which_she_was_born': '₹3500',
        '22_a_child_with_many_pictures_on_it_and_the_words_happy_birthday_written_in_different_languages': '₹1650',
        '25_a_family_tree_with_hearts_and_stars_in_the_background_on_a_black_background_that_says_happy_birthday': '₹1850',
        '11_a_black_and_white_photo_frame_with_pictures_of_people_on_it_including_a_butterfly': '₹650',
        '20_an_abstract_black_and_white_background_with_three_square_frames_in_the_shape_of_a_heart': '₹ Contact us',
        '24_two_polaroid_frames_with_a_red_push_button_on_them_against_a_white_background': 'Contact us',
        '03_a_flyer_for_a_photo_shoot_with_photoshopped_images_on_it_and_flowers_in_the_background': 'Contact us',
        '05_an_advertisement_for_valentine_s_day_with_photos_and_text_on_the_front_in_black_frame': 'Contact us',
        '06_two_black_frames_with_flowers_and_leaves_on_them': 'Contact us',
        '15_the_flyer_for_an_event_with_pictures_of_women_in_red_dresses_and_flowers_on_it': '₹1750',
        '37_the_couple_is_holding_each_other_s_hand_and_posing_for_pictures_in_front_of_them': 'Contact us',
        '14_an_old_photo_of_a_man_sitting_on_the_floor_with_his_hands_behind_his_head': 'Contact us',
        '16_four_different_movie_posters_are_shown_together': 'Contact us',
        '17_a_woman_in_a_blue_sari_standing_next_to_a_red_wheel_with_photos_on_it': 'Contact us',
        '18_three_square_frames_with_hearts_on_them_against_a_red_background': 'Contact us',
        '31_an_open_photo_frame_with_yellow_paper_clippings_on_the_top_and_bottom_corner': 'Contact us',
        '33_the_poster_for_maddavi_murthh': 'Contact us',
        '34_an_image_of_a_white_phone_with_hearts_on_the_front_and_back_side_against_a_gray_background': 'Contact us',
        '35_an_empty_black_frame_on_a_white_background_with_no_image_or_text_in_the_bottom_corner': 'Contact us',
        '02_an_ornate_gold_frame_on_a_white_background': 'Contact us',
        '12_an_ornate_gold_frame_on_a_transparent_background': 'Contact us',
        '13_an_ornate_gold_frame_with_a_white_background_and_golden_trimmings_on_the_edges': 'Contact us',
        '23_an_empty_gold_frame_hanging_on_the_wall_in_front_of_a_white_wall_and_floor': 'Contact us',
        '21_an_empty_frame_hanging_on_the_wall_next_to_a_chair_with_a_plant_in_it': 'Contact us',
        '39_a_white_and_black_photo_frame_on_a_gray_background': 'Contact us',
        '10_an_empty_polaroid_frame_with_some_tape_on_it': 'Contact us',
        // ==========================================
        // Magic Pillows (magic-pillows)
        // ==========================================
        '01_silver_sequin_personalized_magic_pillow': '₹650',
        '02_sequin_magic_cushion_photo_printed': '₹650',
        '03_magic_pillow_with_photo_magical_photo': '₹650',
        '04_personalized_photo_magical_magic_black_pillow': '₹650',
        '05_buy_amazing_magic_pillow_with_photo': '₹650',
        '06_magic_pillow_paridhi_international': '₹650',
        '07_personalized_photo_printed_pillow': '₹650',
        '08_magic_pillow_surprise_in_every_flip': '₹650',
        '09_personalised_magic_sequin_cushion': '₹650',
        '10_personalised_magical_sequin_cushion': '₹650',
        '11_rani_pink_magical_wings_pillow_covers': '₹650',
        '12_magical_unicorn_decorative_pillow': '₹650',
        '13_magic_pillow_with_photo_heart': '₹650',
        '14_magic_pillow_at_instagram': '₹650',
        '15_magical_rainbows_quilted_pillow': '₹650',
        '16_unicorn_pillow_unicorn_cushions': '₹650',
        '17_buy_amazing_magic_pillow_with_photo_2': '₹650',
        '18_personalized_photo_magical_magic_pillow_2': '₹650',
        '19_magic_pillow_photo_printed_pillow': '₹650',
        '20_magic_sequin_cushion': '₹650',
        // ==========================================
        // Normal Pillows (normal-pillows-heart)
        // ==========================================
        '51pxnjzyu6l': '₹549',
        '61abkpfwrzl-550': '₹549',
        '61ognup7sal': '₹549',
        '71a+ls9vapl': '₹549',
        'heart-shape-printed-red-sublimation-fur-cushion-650': '₹649',
        'whatsapp image 2026-05-24 at 12.00.51 pm': '₹450',
        'whatsapp image 2026-05-24 at 12.00.52 pm': '₹450',
        // ==========================================
        // LED Pillows (led-pillows)
        // ==========================================
        'heart led pillow 650': '₹650',
        'led-cushion-500x500-650': '₹650',
        'square pillow with led pillow 650': '₹650',
        'whatsapp image 2026-05-24 at': '₹650',
        'whatsapp image 2026-05-24 at 11.45.05 am': '₹650',
        'whatsapp image 2026-05-24 at 11.45.06 am': '₹650',
        'yellow-led-sublimation-cushion-500x500': '₹650',
        // ==========================================
        // Mug Items (mugs)
        // ==========================================
        '2': '₹450',
        'whatsapp image 2026-05-24 at 11.59.16 am': '₹450',
        'whatsapp image 2026-05-24 at 450': '₹450',
        'colour handlee -300': '₹300',
        'heart handle magic cup -550': '₹550',
        'personalised-heart-handle-coffee-mug-350': '₹350',
        'product-350': '₹350',
        'product-jpeg 350': '₹350',
        'sublimation-mugs-printing-300': '₹300',
        'white-mug-heart-handle-printing- 350': '₹350',
        // ==========================================
        // Wooden Lamps (wooden-lamps)
        // ==========================================
        'whatsapp image 2026-05-24 at 5.29.11 pm (1)': '₹750',
        'whatsapp image 2026-05-24 at 5.29.11 pm': '₹750',
        'whatsapp image 2026-05-24 at 5.29.12 pm': '₹750',
        'whatsapp image 2026-05-24 at 5.29.13 pm': '₹1050',
        'whatsapp image 2026-05-24 at 4.54.14 pm2222222222222222': '₹1350',
        'whatsapp image 2026-05-24 at 4.54.15 pm33333333333': '₹650',
        'whatsapp image 2026-05-24 at 4.54.16 pm666666': '₹650',
        'whatsapp image 2026-05-24 at 4.54.16 pm888888': '₹650',
        'whatsapp image 2026-05-24 at 4.54.16 pm9999': '₹650',
        'whatsapp image 2026-05-24 at 4.54.17 pm7777777777': '₹950',
        'custom-led-lamp-11': '₹450',
        'custom-led-lamp-22': '₹450',
        'custom-led-lamp-33': '₹650',
        'whatsapp image 2026-05-24 at 4.40.12 pm': '₹550',
        'whatsapp image 2026-05-24 at 10.45.03 am': '₹1050',
        'whatsapp image 2026-05-24 at 10.45.03 am555': '₹1050',
        'whatsapp image 2026-05-24 at 10.45.03 am666666': '₹450',
        'whatsapp image 2026-05-24 at 10.45.02 am': '₹1350',
        'whatsapp image 2026-05-24 at 10.45.02 am2': '₹1350',
        'whatsapp image 2026-05-24 at 10.45.05 am3': '₹950',
        'whatsapp image 2026-05-24 at 10.45.06 am33': '₹1050',
        'whatsapp image 2026-05-24 at 10.45.07 am333': '₹650',
        'whatsapp image 2026-05-24 at 10.45.07 am6': '₹950',
        'whatsapp image 2026-05-24 at 10.45.08 am9': '₹650',
        'whatsapp image 2026-05-24 at 10.45.08 am99': '₹450',
        'whatsapp image 2026-05-24 at 10.45.09 am6': '₹950',
        'whatsapp image 2026-05-24 at 10.45.09 am7': '₹950',
        'whatsapp image 2026-05-24 at 10.45.09 am9': '₹1050',
        'whatsapp image 2026-05-24 at 10.45.10 am4': '₹650',
        // ==========================================
        // Premium Keychains (keychains)
        // ==========================================
        '61lujmamh2l-350': '₹350',
        '61n1uryazgl-200': '₹200',
        '71siksr3iwl-100': '₹100',
        'metal marking 200': '₹200',
        'personalised_black_metal_name_keychain': '₹200',
        // ==========================================
        // T-Shirts & Wearables (tshirts)
        // ==========================================
        '01_young_man_printing_on_t_shirt_at_workshop': '₹250',
        '05_white_t_shirt_with_palm_tree_print': '₹250',
        '06_t_shirt_printing_machine_innovation_shirt_and_textile_printer_production': '₹250',
        '510in0gaaxl._ux679_': '₹550',
        '51h7s27ib2l': '₹250',
        'h7fc5ec33914b4a71bccdf281f3f262a4r.jpg_300x300': '₹550',
        'men-sublimation-t-shirt-500x500': '₹550',
        'short-sleeves-plain-sublimation-white-collar-t-shirts-387': '₹550',
        'tshirt-1': '₹550',
        'tshirt-1111': '₹250',
        'tshirt-2': '₹550',
        'tshirt-3': '₹550',
        'tshirt-4': '₹250',
        'tshirt-5': '₹250',
        'tshirt-6': '₹250',
        'tshirt-7': '₹250',
        'whatsapp image 2026-05-24 at 4.55.41 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.55.42 pm (1)': '₹250',
        'whatsapp image 2026-05-24 at 4.55.42 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.55.43 pm (1)': '₹250',
        'whatsapp image 2026-05-24 at 4.55.43 pm (2)': '₹250',
        'whatsapp image 2026-05-24 at 4.55.43 pm': '₹550',
        'whatsapp image 2026-05-24 at 4.55.44 pm (1)': '₹250',
        'whatsapp image 2026-05-24 at 4.55.44 pm (2)': '₹250',
        'whatsapp image 2026-05-24 at 4.55.44 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.55.45 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.55.46 pm (1)': '₹250',
        'whatsapp image 2026-05-24 at 4.55.46 pm': '₹550',
        'whatsapp image 2026-05-24 at 4.56.14 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.56.38 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.57.12 pm': '₹550',
        'whatsapp image 2026-05-24 at 4.58.18 pm': '₹180',
        'whatsapp image 2026-05-24 at 4.58.55 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.59.16 pm': '₹250',
        'whatsapp image 2026-05-24 at 4.59.36 pm': '₹250',
        'whatsapp image 2026-05-24 at 5.00.09 pm': '₹550',
        'whatsapp image 2026-05-24 at 5.00.10 pm': '₹550',
        // ==========================================
        // Wall Clocks (wall-clocks)
        // ==========================================
        'whatsapp image 2026-05-24 at 5.51.44 pm (1)': 'Soon',
        'whatsapp image 2026-05-24 at 5.51.44 pm': 'Soon',
        'whatsapp image 2026-05-24 at 5.51.45 pm (1)': 'Soon',
        'whatsapp image 2026-05-24 at 5.51.45 pm': 'Soon ',
        'whatsapp image 2026-05-24 at 5.51.46 pm': 'Soon',
        'whatsapp image 2026-05-24 at 5.51.47 pm (1)': 'Soon',
        'whatsapp image 2026-05-24 at 5.51.47 pm (2)': 'Soon',
        'whatsapp image 2026-05-24 at 5.51.47 pm': 'Soon',
        'whatsapp image 2026-05-24 at 5.51.48 pm': 'Soon',
        'download (1)': 'Soon',
        'download (2)': 'Soon',
        'download (3)': 'Soon',
        'download (4)': 'Soon',
        'download (5)': 'Soon',
        'download': 'Soon',
        'wall-clock-custom': 'Soon',
        // ==========================================
        // Personalized Bottles (bottles)
        // ==========================================
        '71zowrhaw8l. 500ml  350': '₹350',
        'black with logo 650': '₹650',
        'bottle-ok': '₹450',
        'download  750 ml 450': '₹650',
        'images  750': '₹750',
        'images (1)': '₹350',
        'images (10) 499': '₹499',
        'images (2)': '₹450',
        'images (4) 750': '₹750',
        'images (5)': '₹650',
        'images (6)': '₹350',
        'images (7) 650': '₹650',
        'images (8)': '₹650',
        'images (9)': '₹650',
        'images': '₹450',
        'silver with logo 650': '₹650',
        // ==========================================
        // Customized Pens (pens)
        // ==========================================
        'whatsapp image 2026-05-24 at 4.06.02 pm 44': '250',
        'whatsapp image 2026-05-24 at 4.06.03 pm55': '₹300',    
        'whatsapp image 2026-05-24 at 4.07.28 pm55': '₹200',
        'whatsapp image 2026-05-24 at 4.08.19 pm66': '₹250',
        'whatsapp image 2026-05-24 at 4.09.08 pm555555': '₹200',
        'whatsapp image 2026-05-24 at 4.10.34 pm666': '₹300',
        'matte-black-engraved-pen': '₹550',
        'royal-gold-rollerball-pen': '₹450',
        'bamboo-engraved-pen': '₹150',
        'carbon-fiber-gift-pen': '₹650',
        // ==========================================
        // Devotional God Frames (god-frames)
        // ==========================================
        'whatsapp image 2026-05-24 at 5.52.19 pm': '₹550',
        'whatsapp image 2026-05-24 at 5.52.20 pm (1)': '₹450',
        'whatsapp image 2026-05-24 at 5.52.20 pm (2)': '₹550',
        'whatsapp image 2026-05-24 at 5.52.20 pm': '₹550',
        'whatsapp image 2026-05-24 at 5.52.21 pm (1)': '₹750',
        'whatsapp image 2026-05-24 at 5.52.21 pm': '₹550',
        'whatsapp image 2026-05-24 at 5.52.22 pm (1)': '₹350',
        'whatsapp image 2026-05-24 at 5.52.22 pm': '₹450',
        // ==========================================
        // Premium Devotional Statues (statues)
        // ==========================================
        'whatsapp image 2026-05-24 at 6.05.51 pm (1)': '₹650',
        'whatsapp image 2026-05-24 at 6.05.51 pm (2)': '₹550',
        'whatsapp image 2026-05-24 at 6.05.51 pm': '₹550',
        'whatsapp image 2026-05-24 at 6.05.52 pm (1)': '₹850',
        'whatsapp image 2026-05-24 at 6.05.52 pm': '₹850',
        'whatsapp image 2026-05-24 at 6.05.55 pm': '₹850',
        'whatsapp image 2026-05-24 at 6.05.56 pm (1)': '₹1650',
        'whatsapp image 2026-05-24 at 6.05.56 pm': '₹850',
        'whatsapp image 2026-05-24 at 6.05.57 pm (1)': '₹1250',
        'whatsapp image 2026-05-24 at 6.05.57 pm (2)': '₹1250',
        'whatsapp image 2026-05-24 at 6.05.57 pm': '₹2500',
        'whatsapp image 2026-05-24 at 6.05.58 pm (1)': '₹2500',
        'whatsapp image 2026-05-24 at 6.05.58 pm (2)': '₹650',
        'whatsapp image 2026-05-24 at 6.05.58 pm': '₹750',
        'whatsapp image 2026-05-24 at 6.05.59 pm (1)': '₹1250',
        'whatsapp image 2026-05-24 at 6.05.59 pm': '₹1250',
        'whatsapp image 2026-05-24 at 6.06.00 pm (1)': '₹2500',
        'whatsapp image 2026-05-24 at 6.06.00 pm (2)': '₹3500',
        'whatsapp image 2026-05-24 at 6.06.00 pm': '₹1250',
        'whatsapp image 2026-05-24 at 6.14.26 pm (1)': '₹650',
        'whatsapp image 2026-05-24 at 6.14.26 pm': '₹350',
        'whatsapp image 2026-05-24 at 6.14.27 pm': '₹950',
        'whatsapp image 2026-05-24 at 6.14.28 pm (1)': '₹650',
        'whatsapp image 2026-05-24 at 6.14.28 pm': '₹450',
        'whatsapp image 2026-05-24 at 6.14.30 pm (1)': '₹450',
        'whatsapp image 2026-05-24 at 6.14.30 pm (2)': '₹450',
        'whatsapp image 2026-05-24 at 6.14.30 pm (3)': '₹850',
        'whatsapp image 2026-05-24 at 6.14.30 pm': '₹850',
        'whatsapp image 2026-05-24 at 6.14.31 pm (1)': '₹350',
        'whatsapp image 2026-05-24 at 6.14.31 pm (2)': '₹550',
        'whatsapp image 2026-05-24 at 6.14.31 pm (3)': '₹550',
        'whatsapp image 2026-05-24 at 6.14.31 pm': '₹550',
        'whatsapp image 2026-05-24 at 6.14.32 pm': '₹550',
        // ==========================================
        // Premium Indoor Water Fountains (waterfountain)
        // ==========================================
        'whatsapp image 2026-05-24 at 8.11.05 pm': '₹3500',
        'whatsapp image 2026-05-24 at 8.11.06 pm (1)': '₹4500',
        'whatsapp image 2026-05-24 at 8.11.06 pm (2)': '₹4500',
        'whatsapp image 2026-05-24 at 8.11.06 pm (3)': '₹3500',
        'whatsapp image 2026-05-24 at 8.11.06 pm': '₹2500',
        'whatsapp image 2026-05-24 at 8.15.58 pm': '₹2500',
        'whatsapp image 2026-05-24 at 8.15.59 pm (1)': '₹2150',
        'whatsapp image 2026-05-24 at 8.15.59 pm (2)': '₹2500',
        'whatsapp image 2026-05-24 at 8.15.59 pm (3)': '₹2150',
        'whatsapp image 2026-05-24 at 8.15.59 pm': '₹2500',
        // ==========================================
        // Customized Premium Wallets (wallet)
        // ==========================================
        'whatsapp image 2026-05-24 at 8.24.27 pm (1)': '₹450',
        'whatsapp image 2026-05-24 at 8.24.27 pm': '₹450',
        'whatsapp image 2026-05-24 at 8.24.28 pm (1)': '₹450',
        'whatsapp image 2026-05-24 at 8.24.28 pm (2)': '₹450',
        'whatsapp image 2026-05-24 at 8.24.28 pm': '₹450',
        'whatsapp image 2026-05-24 at 8.24.29 pm (1)': '₹450',
        'whatsapp image 2026-05-24 at 8.24.29 pm': '₹450',



    };

    function cleanProductName(imgPath) {
        if (!imgPath) return 'Custom Product';
        
        let path = imgPath.toLowerCase();
        let filename = path.split('/').pop();
        
        const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "").trim();
        const exactKey = filenameWithoutExt.toLowerCase();
        const baseName = exactKey.replace(/(?:-|\s)(\d+)$/, "").trim();
        
        // 1. FAST LOOKUP IN GLOBAL NAMES DICTIONARY
        if (GLOBAL_PRODUCT_NAMES[exactKey]) {
            return GLOBAL_PRODUCT_NAMES[exactKey];
        }
        if (GLOBAL_PRODUCT_NAMES[baseName]) {
            return GLOBAL_PRODUCT_NAMES[baseName];
        }
        
        // Detect if it's a UUID (long string of hex and dashes)
        const isUUID = /[0-9a-f]{8}-[0-9a-f]{4}/.test(filename);
        
        // Smarter detection for Signature Collection (especially UUIDs)
        if (path.includes('signature-collection') || path.includes('processed') || path.includes('downloaded') || isUUID) {
            if (path.includes('mug')) return 'Signature Designer Mug';
            if (path.includes('clock') || path.includes('ship')) return 'Artisan Ship Wheel Clock';
            if (path.includes('pentagon') || path.includes('revolving') || path.includes('lamp')) return 'Revolving LED Lamp';
            if (path.includes('pillow')) return 'Magic Photo Pillow';
            if (path.includes('tshirt')) return 'Custom Premium Tee';
            if (path.includes('keychain')) return 'Bespoke Photo Keychain';
            if (path.includes('spotify')) return 'Spotify Glass Frame';
            if (path.includes('led')) return 'LED Light Showcase';
            if (path.includes('mirror')) return 'Magic Mirror Showcase';
            if (path.includes('photo_frame') || path.includes('frame') || path.includes('collage') || path.includes('mosaic')) return 'Signature Wall Frame';
            
            // If it's a UUID and no keyword matched, don't show random letters
            if (isUUID) return 'Premium Studio Selection';
        }

        let name = filename
            .replace(/[-_0-9]+/g, ' ')
            .replace(/\.(png|jpg|jpeg|webp|jpeg)$/i, '')
            .toLowerCase()
            .trim();
            
        // Stop words to remove for shorter, more accurate names
        const stopWords = ['a', 'an', 'the', 'and', 'with', 'in', 'on', 'at', 'of', 'for', 'to', 'from', 'it', 'them', 'her', 'his', 'my', 'your', 'its', 'their', 'some', 'many', 'by', 'as', 'is', 'are', 'was', 'were', 'which', 'who', 'has', 'have', 'had', 'been', 'being', 'be', 'into', 'upon', 'within', 'around', 'through', 'about', 'above', 'below', 'under', 'over', 'out', 'up', 'down', 'next', 'back', 'front', 'side', 'top', 'bottom', 'left', 'right', 'image', 'picture', 'photo', 'shot', 'view', 'background', 'isolated', 'white', 'black', 'gray', 'grey', 'transparent', 'on', 'it', 'them'];
        
        // Filter out stop words and empty strings
        let words = name.split(' ').filter(word => word.length > 1 && !stopWords.includes(word));
        
        // Limit to 4 key words for shortness
        words = words.slice(0, 4);
        
        if (words.length === 0) {
            // Fallback: Use the folder name to identify
            if (path.includes('mug')) return 'Custom Designer Mug';
            if (path.includes('frame')) return 'Premium Wall Frame';
            if (path.includes('pillow')) return 'Magic Photo Pillow';
            return 'Signature Masterpiece';
        }
        
        // Professional Title Casing
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    function getPriceByPath(categoryKey, imgPath) {
        const name = (imgPath || '').toLowerCase();
        const filenameWithoutExt = name.split('/').pop().replace(/\.[^/.]+$/, "").trim();
        const exactKey = filenameWithoutExt.toLowerCase();
        const baseName = exactKey.replace(/(?:-|\s)(\d+)$/, "").trim();
        
        // 1. FAST LOOKUP IN GLOBAL PRICES DICTIONARY
        if (GLOBAL_PRODUCT_PRICES[exactKey]) {
            return GLOBAL_PRODUCT_PRICES[exactKey];
        }
        if (GLOBAL_PRODUCT_PRICES[baseName]) {
            return GLOBAL_PRODUCT_PRICES[baseName];
        }
        
        // 2. BACKWARD-COMPATIBLE FALLBACKS (If adding new images manually in the future)
        if (categoryKey === 'normal-pillows-heart') {
            if (name.includes('650')) {
                return '₹649';
            }
            return '₹549';
        }
        
        if (categoryKey === 'mugs') {
            const priceMatch = filenameWithoutExt.match(/(?:-|\s|^)(\d+)\s*$/);
            if (priceMatch) {
                const parsedPrice = parseInt(priceMatch[1]);
                if (parsedPrice >= 100) {
                    return `₹${parsedPrice}`;
                }
            }
            return '₹250'; // Default starting price
        }
        
        if (categoryKey === 'keychains') {
            const priceMatch = filenameWithoutExt.match(/(?:-|\s)(\d+)$/);
            if (priceMatch) {
                return `₹${priceMatch[1]}`;
            }
            return '₹200'; // Default premium keychain price
        }
        
        if (categoryKey === 'wall-clocks') {
            return '₹749';
        }
        
        if (categoryKey === 'bottles') {
            const priceMatch = filenameWithoutExt.match(/(?:-|\s|^)(\d+)\s*$/);
            if (priceMatch) {
                const parsedPrice = parseInt(priceMatch[1]);
                if (parsedPrice >= 100) {
                    return `₹${parsedPrice}`;
                }
            }
            return '₹450';
        }
        
        // Check if price is explicitly defined at the end of the filename (e.g. -550 or -650)
        const filenameWithoutPrice = name.split('/').pop().replace(/(?:-|\s)(\d+)$/, "").trim();
        const priceMatch = filenameWithoutPrice.match(/(?:-|\s)(\d+)$/);
        if (priceMatch) {
            return `₹${priceMatch[1]}`;
        }
        
        // Price Map based on User Image
        const prices = {
            'mugs': { magic: 450, heart: 350, color: 250, small: 150, plain: 200, gold: 450, silver: 450, default: 250 },
            'wooden-lamps': { pentagon: 1350, revolving: 1050, rotating: 850, shadow: 950, mdf: 750, magnetic: 950, best: 750, family: 750, award: 750, aluminium: 550, small: 480, default: 750 },
            'magic-pillows': { magic: 650, led: 750, normal: 550, heart: 550, square: 550, default: 550 },
            'normal-pillows-heart': { default: 549 },
            'keychains': { single: 100, double: 100, fridge: 100, bottle: 650, default: 100 },
            'tshirts': { white: 180, corporate: 450, black: 350, children: 250, mask: 60, cap: 180, default: 250 },
            'photo-frames': { '12x36': 1350, '12x24': 1150, '12x20': 1050, '12x8': 750, spotify: 650, mirror: 650, default: 750 }
        };

        // If it's the mixed signature collection, check all maps
        if (categoryKey === 'signature-collection' || /processed|downloaded/.test(name)) {
            for (const cat in prices) {
                const map = prices[cat];
                for (const key in map) {
                    if (key !== 'default' && name.includes(key)) return `₹${map[key]}`;
                }
            }
            
            // Contextual guess for UUID items in signature collection
            if (name.includes('clock') || name.includes('ship')) return `₹750`;
            if (name.includes('frame') || name.includes('collage')) return `₹750`;
            
            return `₹650`; // Reasonable default for premium signature items
        }

        const catPrices = prices[categoryKey] || { default: 499 };
        
        for (const key in catPrices) {
            if (name.includes(key)) return `₹${catPrices[key]}`;
        }
        return `₹${catPrices.default}`;
    }

    window.openCatalogProductModal = function(categoryTitle, item) {
        if (!amazonModal || !amazonModalImg || !amazonModalTitle || !amazonModalPrice || !amazonModalOrderBtn || !amazonModalWaBtn) {
            return;
        }

        amazonModalImg.src = item.image;
        amazonModalTitle.textContent = item.name;
        amazonModalPrice.textContent = item.price ? item.price.replace('₹', '') : '';
        amazonModalWaBtn.href = `https://wa.me/917731879736?text=${encodeURIComponent(`Hi SS Magic Printers, I am interested in the '${item.name}' from ${categoryTitle} (${item.price}). Can you share more details?`)}`;

        amazonModalOrderBtn.onclick = () => {
            amazonModal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => openOrderModal(item.name), 300);
        };

        if (typeof window.loadReviews === 'function') {
            window.loadReviews(item.name);
        }

        // Render similar products
        const similarSection = document.getElementById('similar-products-section');
        const similarProductsContainer = document.getElementById('modal-similar-products');
        
        if (similarSection && similarProductsContainer && catalogData && catalogData.length > 0) {
            let category = catalogData.find(c => 
                c.title.toLowerCase().includes(categoryTitle.toLowerCase()) || 
                categoryTitle.toLowerCase().includes(c.title.toLowerCase()) ||
                c.key.toLowerCase().includes(categoryTitle.toLowerCase())
            );

            if (!category) {
                category = catalogData.find(c => c.images && c.images.length > 0);
            }

            if (category && category.images && category.images.length > 0) {
                const currentImgName = item.image.split('/').pop().split('?')[0].toLowerCase();
                const similarItems = category.images
                    .filter(img => {
                        const imgName = img.split('/').pop().toLowerCase();
                        return imgName !== currentImgName;
                    })
                    .slice(0, 10)
                    .map(imgPath => {
                        return {
                            name: cleanProductName(imgPath),
                            image: imgPath,
                            price: getPriceByPath(category.key, imgPath)
                        };
                    });
                
                if (similarItems.length > 0) {
                    similarSection.style.display = 'block';
                    similarProductsContainer.innerHTML = similarItems.map(sim => `
                        <div class="modal-sim-card" onclick="window.openCatalogProductModal('${categoryTitle}', {name: '${sim.name.replace(/'/g, "\\'")}', image: '${sim.image}', price: '${sim.price}'})">
                            <div class="modal-sim-img-wrap">
                                <img src="${sim.image}" alt="${sim.name}">
                            </div>
                            <h5>${sim.name}</h5>
                            <div class="modal-sim-meta">
                                <span class="modal-sim-price">${sim.price}</span>
                                <span class="modal-sim-rating"><i class="ph-fill ph-star"></i> 4.8</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    similarSection.style.display = 'none';
                }
            } else {
                similarSection.style.display = 'none';
            }
        }

        amazonModal.classList.remove('hidden');
        setTimeout(() => {
            amazonModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            const modalBody = amazonModal.querySelector('.amazon-modal-body');
            if (modalBody) modalBody.scrollTop = 0;
            const modalContent = amazonModal.querySelector('.amazon-modal-content');
            if (modalContent) modalContent.scrollTop = 0;
        }, 10);
    }
    
    // Expose for similar products inline onclick handler
    window.openCatalogProductModal = openCatalogProductModal;

    function renderCatalogFilters() {
        if (!catalogFilterButtons) return;

        const filters = catalogData.map(category => ({ key: category.key, label: category.title }));

        catalogFilterButtons.innerHTML = filters.map((filter, index) => `
            <button type="button" class="catalog-filter-btn ${index === 0 ? 'active' : ''}" data-catalog-filter="${filter.key}">${filter.label}</button>
        `).join('');

        catalogFilterButtons.querySelectorAll('[data-catalog-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                catalogFilterButtons.querySelectorAll('.catalog-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderCatalogProducts(btn.getAttribute('data-catalog-filter') || 'all');
            });
        });
    }

    function renderCatalogProducts(filterKey = 'all') {
        if (!catalogProductGrid) return;

        catalogProductGrid.classList.remove('catalog-grid-keychains');
        if (filterKey === 'keychains') {
            catalogProductGrid.classList.add('catalog-grid-keychains');
        }

        const categories = catalogData.filter(category => category.key === filterKey);

        const items = categories.flatMap(category => category.images.map(imgPath => {
            return {
                name: cleanProductName(imgPath),
                price: getPriceByPath(category.key, imgPath),
                image: imgPath,
                categoryTitle: category.title
            };
        }));

        if (items.length === 0) {
            catalogProductGrid.innerHTML = '<p class="section-desc" style="margin: 0;">No products found for this category.</p>';
            return;
        }

        catalogProductGrid.innerHTML = items.map(item => `
            <div class="catalog-product-card" data-category-title="${item.categoryTitle}" data-item-name="${item.name}">
                <button type="button" class="catalog-product-image-wrap" aria-label="View ${item.name} details">
                    <img src="${item.image}" alt="${item.name}" class="catalog-product-image" loading="lazy">
                </button>
                <div class="catalog-product-info">
                    <span class="catalog-product-category">${item.categoryTitle}</span>
                    <h4>${item.name}</h4>
                    <div class="catalog-product-price-row">
                        <span class="catalog-product-price">${item.price}</span>
                        <span class="catalog-product-status"><i class="ph-bold ph-check-circle"></i> In Stock</span>
                    </div>
                </div>
                <button type="button" class="btn catalog-order-btn">
                    <i class="ph-bold ph-whatsapp-logo"></i> Order on WhatsApp
                </button>
            </div>
        `).join('');

        catalogProductGrid.querySelectorAll('.catalog-product-card').forEach(card => {
            const categoryTitle = card.getAttribute('data-category-title') || 'Products';
            const item = items.find(entry => entry.name === card.getAttribute('data-item-name'));
            if (!item) return;

            card.querySelector('.catalog-product-image-wrap')?.addEventListener('click', (e) => {
                e.stopPropagation();
                openCatalogProductModal(categoryTitle, item);
            });

            card.querySelector('.catalog-order-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                openOrderModal(`${item.name} (${item.price})`);
            });

            card.addEventListener('click', () => openCatalogProductModal(categoryTitle, item));
        });
    }

    // Minified Fallback Catalog Manifest (Ensures 100% functionality offline, or when fetch is blocked by mobile privacy content blockers/adblockers)
    const FALLBACK_CATALOG_DATA = [{"key": "wooden-lamps", "title": "Wooden Lamps", "images": ["Lamps/WhatsApp Image 2026-05-24 at 5.29.11 PM (1).jpeg", "Lamps/WhatsApp Image 2026-05-24 at 5.29.11 PM.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 5.29.12 PM.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 5.29.13 PM.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 4.54.14 PM2222222222222222.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 4.54.15 PM33333333333.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 4.54.16 PM666666.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 4.54.16 PM888888.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 4.54.16 PM9999.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 4.54.17 PM7777777777.jpeg", "Lamps/custom-led-lamp-11.jpeg", "Lamps/custom-led-lamp-22.jpeg", "Lamps/custom-led-lamp-33.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 4.40.12 PM.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.03 AM.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.03 AM555.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.03 AM666666.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.02 AM.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.02 AM2.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.05 AM3.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.06 AM33.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.07 AM333.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.07 AM6.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.08 AM9.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.08 AM99.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.09 AM6.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.09 AM7.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.09 AM9.jpeg", "Lamps/WhatsApp Image 2026-05-24 at 10.45.10 AM4.jpeg"]}, {"key": "photo-frames", "title": "Photo Frames", "images": ["photo_frames/other/5.jpeg", "photo_frames/other/WhatsApp Image 2026-05-24 at 11.37.19 AM.jpeg", "photo_frames/other/WhatsApp Image 2026-05-24 at 11.37.20 AM m.jpeg", "photo_frames/other/WhatsApp Image 2026-05-24 at 11.37.20 AM.jpeg", "photo_frames/other/WhatsApp Image 2026-05-24 at 11.37.20 AMr.jpeg", "photo_frames/other/WhatsApp Image 2026-05-24 at 11.37.21 AM4.jpeg", "photo_frames/collage/04_a_heart_shaped_photo_collage_with_two_people_in_it.jpg", "photo_frames/collage/29_three_photos_with_the_words_best_moment_on_them_are_placed_in_front_of_a_yellow_background.jpg", "photo_frames/birthday/01_a_child_s_birthday_card_with_photos_of_her_and_the_date_in_which_she_was_born.jpg", "photo_frames/birthday/22_a_child_with_many_pictures_on_it_and_the_words_happy_birthday_written_in_different_languages.jpg", "photo_frames/birthday/25_a_family_tree_with_hearts_and_stars_in_the_background_on_a_black_background_that_says_happy_birthday.jpg", "photo_frames/black_frame/11_a_black_and_white_photo_frame_with_pictures_of_people_on_it_including_a_butterfly.jpg", "photo_frames/wedding/15_the_flyer_for_an_event_with_pictures_of_women_in_red_dresses_and_flowers_on_it.jpg", "photo_frames/black_frame/20_an_abstract_black_and_white_background_with_three_square_frames_in_the_shape_of_a_heart.jpg", "photo_frames/polaroid/24_two_polaroid_frames_with_a_red_push_button_on_them_against_a_white_background.jpg", "photo_frames/wedding/03_a_flyer_for_a_photo_shoot_with_photoshopped_images_on_it_and_flowers_in_the_background.jpg", "photo_frames/wedding/05_an_advertisement_for_valentine_s_day_with_photos_and_text_on_the_front_in_black_frame.jpg", "photo_frames/wedding/06_two_black_frames_with_flowers_and_leaves_on_them.jpg", "photo_frames/wedding/37_the_couple_is_holding_each_other_s_hand_and_posing_for_pictures_in_front_of_them.jpg", "photo_frames/other/14_an_old_photo_of_a_man_sitting_on_the_floor_with_his_hands_behind_his_head.jpg", "photo_frames/other/16_four_different_movie_posters_are_shown_together.jpg", "photo_frames/other/17_a_woman_in_a_blue_sari_standing_next_to_a_red_wheel_with_photos_on_it.jpg", "photo_frames/other/18_three_square_frames_with_hearts_on_them_against_a_red_background.jpg", "photo_frames/other/31_an_open_photo_frame_with_yellow_paper_clippings_on_the_top_and_bottom_corner.jpg", "photo_frames/other/33_the_poster_for_maddavi_murthh.jpg", "photo_frames/other/34_an_image_of_a_white_phone_with_hearts_on_the_front_and_back_side_against_a_gray_background.jpg", "photo_frames/black_frame/35_an_empty_black_frame_on_a_white_background_with_no_image_or_text_in_the_bottom_corner.jpg", "photo_frames/gold_frame/02_an_ornate_gold_frame_on_a_white_background.jpg", "photo_frames/gold_frame/12_an_ornate_gold_frame_on_a_transparent_background.jpg", "photo_frames/gold_frame/13_an_ornate_gold_frame_with_a_white_background_and_golden_trimmings_on_the_edges.jpg", "photo_frames/gold_frame/23_an_empty_gold_frame_hanging_on_the_wall_in_front_of_a_white_wall_and_floor.jpg", "photo_frames/other/21_an_empty_frame_hanging_on_the_wall_next_to_a_chair_with_a_plant_in_it.jpg", "photo_frames/other/39_a_white_and_black_photo_frame_on_a_gray_background.jpg", "photo_frames/polaroid/10_an_empty_polaroid_frame_with_some_tape_on_it.jpg"]}, {"key": "magic-pillows", "title": "Magic Pillows", "images": ["magic_pillow/01_silver_sequin_personalized_magic_pillow.jpg", "magic_pillow/02_sequin_magic_cushion_photo_printed.jpg", "magic_pillow/03_magic_pillow_with_photo_magical_photo.jpg", "magic_pillow/04_personalized_photo_magical_magic_black_pillow.jpg", "magic_pillow/05_buy_amazing_magic_pillow_with_photo.jpg", "magic_pillow/06_magic_pillow_paridhi_international.jpg", "magic_pillow/07_personalized_photo_printed_pillow.jpg", "magic_pillow/08_magic_pillow_surprise_in_every_flip.jpg", "magic_pillow/09_personalised_magic_sequin_cushion.jpg", "magic_pillow/10_personalised_magical_sequin_cushion.jpg", "magic_pillow/11_rani_pink_magical_wings_pillow_covers.jpg", "magic_pillow/12_magical_unicorn_decorative_pillow.jpg", "magic_pillow/13_magic_pillow_with_photo_heart.jpg", "magic_pillow/14_magic_pillow_at_instagram.jpg", "magic_pillow/15_magical_rainbows_quilted_pillow.jpg", "magic_pillow/16_unicorn_pillow_unicorn_cushions.jpg", "magic_pillow/17_buy_amazing_magic_pillow_with_photo_2.jpg", "magic_pillow/18_personalized_photo_magical_magic_pillow_2.jpg", "magic_pillow/19_magic_pillow_photo_printed_pillow.jpg", "magic_pillow/20_magic_sequin_cushion.jpg"]}, {"key": "normal-pillows-heart", "title": "Normal Pillows", "images": ["magic_pillow/51Pxnjzyu6L.webp", "magic_pillow/61aBKpFwrzL-550.webp", "magic_pillow/61OGnUp7sAL.webp", "magic_pillow/71a+LS9vApL.webp", "magic_pillow/heart-shape-printed-red-sublimation-fur-cushion-650.webp", "magic_pillow/small pillows/WhatsApp Image 2026-05-24 at 12.00.51 PM.jpeg", "magic_pillow/small pillows/WhatsApp Image 2026-05-24 at 12.00.52 PM.jpeg"]}, {"key": "led-pillows", "title": "LED Pillows", "images": ["magic_pillow/led pillows/heart led pillow 650 .jpeg", "magic_pillow/led pillows/led-cushion-500x500-650.webp", "magic_pillow/led pillows/square pillow with led pillow 650 .webp", "magic_pillow/led pillows/WhatsApp Image 2026-05-24 at .jpeg", "magic_pillow/led pillows/WhatsApp Image 2026-05-24 at 11.45.05 AM.jpeg", "magic_pillow/led pillows/WhatsApp Image 2026-05-24 at 11.45.06 AM.jpeg", "magic_pillow/led pillows/yellow-led-sublimation-cushion-500x500.webp"]}, {"key": "mugs", "title": "Mug Items", "images": ["mug/2.jpeg", "mug/WhatsApp Image 2026-05-24 at 11.59.16 AM.jpeg", "mug/WhatsApp Image 2026-05-24 at 450.jpeg", "mug/colour handlee -300.webp", "mug/heart handle magic cup -550.webp", "mug/Personalised-Heart-Handle-Coffee-Mug-350.webp", "mug/product-350.webp", "mug/product-jpeg 350.webp", "mug/Sublimation-Mugs-Printing-300.webp", "mug/White-Mug-Heart-Handle-Printing- 350.webp"]}, {"key": "keychains", "title": "Premium Keychains", "images": ["key chains/61LujmAMH2L-350.webp", "key chains/61n1UrYaZGL-200.webp", "key chains/71SiKsr3iwL-100.webp", "key chains/metal marking 200.webp", "key chains/personalised_black_metal_name_keychain.webp"]}, {"key": "tshirts", "title": "T-Shirts & Wearables", "images": ["tshirt/01_young_man_printing_on_t_shirt_at_workshop.jpg", "tshirt/05_white_t_shirt_with_palm_tree_print.jpg", "tshirt/06_t_shirt_printing_machine_innovation_shirt_and_textile_printer_production.jpg", "tshirt/510iN0GAAxL._UX679_.webp", "tshirt/51H7s27ib2L.webp", "tshirt/H7fc5ec33914b4a71bccdf281f3f262a4r.jpg_300x300.webp", "tshirt/men-sublimation-t-shirt-500x500.webp", "tshirt/short-sleeves-plain-sublimation-white-collar-t-shirts-387.webp", "tshirt/tshirt-1.jpeg", "tshirt/tshirt-1111.jpeg", "tshirt/tshirt-2.jpeg", "tshirt/tshirt-3.jpeg", "tshirt/tshirt-4.jpeg", "tshirt/tshirt-5.jpeg", "tshirt/tshirt-6.jpeg", "tshirt/tshirt-7.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.41 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.42 PM (1).jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.42 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.43 PM (1).jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.43 PM (2).jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.43 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.44 PM (1).jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.44 PM (2).jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.44 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.45 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.46 PM (1).jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.55.46 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.56.14 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.56.38 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.57.12 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.58.18 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.58.55 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.59.16 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 4.59.36 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 5.00.09 PM.jpeg", "tshirt/WhatsApp Image 2026-05-24 at 5.00.10 PM.jpeg"]}, {"key": "wall-clocks", "title": "Wall Clocks", "images": ["wall clocks/WhatsApp Image 2026-05-24 at 5.51.44 PM (1).jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.44 PM.jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.45 PM (1).jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.45 PM.jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.46 PM.jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.47 PM (1).jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.47 PM (2).jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.47 PM.jpeg", "wall clocks/WhatsApp Image 2026-05-24 at 5.51.48 PM.jpeg", "wall clocks/download (1).jpg", "wall clocks/download (2).jpg", "wall clocks/download (3).jpg", "wall clocks/download (4).jpg", "wall clocks/download (5).jpg", "wall clocks/download.jpg", "wall clocks/wall-clock-custom.jpg"]}, {"key": "bottles", "title": "Personalized Bottles", "images": ["bottles/71ZowrhAW8L. 500ml  350 .jpg", "bottles/black with logo 650 .webp", "bottles/bottle-ok.webp", "bottles/download  750 ml 450 .jpg", "bottles/images  750 .jpg", "bottles/images (1).jpg", "bottles/images (10) 499.jpg", "bottles/images (2).jpg", "bottles/images (4) 750 .jpg", "bottles/images (5).jpg", "bottles/images (6).jpg", "bottles/images (7) 650 .jpg", "bottles/images (8).jpg", "bottles/images (9).jpg", "bottles/images.jpg", "bottles/silver with logo 650  .jpeg"]}, {"key": "pens", "title": "Customized Pens", "images": ["pens/WhatsApp Image 2026-05-24 at 4.06.02 PM 44.jpeg", "pens/WhatsApp Image 2026-05-24 at 4.06.03 PM55.jpeg", "pens/WhatsApp Image 2026-05-24 at 4.07.28 PM55.jpeg", "pens/WhatsApp Image 2026-05-24 at 4.08.19 PM66.jpeg", "pens/WhatsApp Image 2026-05-24 at 4.09.08 PM555555.jpeg", "pens/WhatsApp Image 2026-05-24 at 4.10.34 PM666.jpeg", "pens/matte-black-engraved-pen.png", "pens/royal-gold-rollerball-pen.png", "pens/bamboo-engraved-pen.png", "pens/carbon-fiber-gift-pen.png"]}, {"key": "god-frames", "title": "Devotional God Frames", "images": ["God frames/WhatsApp Image 2026-05-24 at 5.52.19 PM.jpeg", "God frames/WhatsApp Image 2026-05-24 at 5.52.20 PM (1).jpeg", "God frames/WhatsApp Image 2026-05-24 at 5.52.20 PM (2).jpeg", "God frames/WhatsApp Image 2026-05-24 at 5.52.20 PM.jpeg", "God frames/WhatsApp Image 2026-05-24 at 5.52.21 PM (1).jpeg", "God frames/WhatsApp Image 2026-05-24 at 5.52.21 PM.jpeg", "God frames/WhatsApp Image 2026-05-24 at 5.52.22 PM (1).jpeg", "God frames/WhatsApp Image 2026-05-24 at 5.52.22 PM.jpeg"]}, {"key": "statues", "title": "Premium Devotional Statues", "images": ["statues/WhatsApp Image 2026-05-24 at 6.05.51 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.51 PM (2).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.51 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.52 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.52 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.55 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.56 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.56 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.57 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.57 PM (2).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.57 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.58 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.58 PM (2).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.58 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.59 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.05.59 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.06.00 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.06.00 PM (2).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.06.00 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.26 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.26 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.27 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.28 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.28 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.30 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.30 PM (2).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.30 PM (3).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.30 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.31 PM (1).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.31 PM (2).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.31 PM (3).jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.31 PM.jpeg", "statues/WhatsApp Image 2026-05-24 at 6.14.32 PM.jpeg"]}, {"key": "waterfountain", "title": "Premium Indoor Water Fountains", "images": ["waterfountain/WhatsApp Image 2026-05-24 at 8.11.05 PM.jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.11.06 PM (1).jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.11.06 PM (2).jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.11.06 PM (3).jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.11.06 PM.jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.15.58 PM.jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.15.59 PM (1).jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.15.59 PM (2).jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.15.59 PM (3).jpeg", "waterfountain/WhatsApp Image 2026-05-24 at 8.15.59 PM.jpeg"]}, {"key": "wallet", "title": "Customized Premium Wallets", "images": ["wallet/WhatsApp Image 2026-05-24 at 8.24.27 PM (1).jpeg", "wallet/WhatsApp Image 2026-05-24 at 8.24.27 PM.jpeg", "wallet/WhatsApp Image 2026-05-24 at 8.24.28 PM (1).jpeg", "wallet/WhatsApp Image 2026-05-24 at 8.24.28 PM (2).jpeg", "wallet/WhatsApp Image 2026-05-24 at 8.24.28 PM.jpeg", "wallet/WhatsApp Image 2026-05-24 at 8.24.29 PM (1).jpeg", "wallet/WhatsApp Image 2026-05-24 at 8.24.29 PM.jpeg"]}];

    // Load manifest with cache-buster to prevent any stale category tabs
    // Note: We use a static version tag '?v=1.0.3' instead of 'Date.now()' because dynamic timestamps 
    // trigger tracking blocker heuristics in privacy-focused mobile browsers (Safari with content blockers, Brave, etc.)
    fetch('catalog-manifest.json?v=1.0.3').then(resp => {
        if (!resp.ok) throw new Error('relative manifest fetch failed');
        return resp.json();
    }).catch(() => {
        // Retry with root absolute path
        return fetch('/catalog-manifest.json?v=1.0.3').then(resp => {
            if (!resp.ok) throw new Error('absolute manifest fetch failed');
            return resp.json();
        });
    }).then(manifest => {
        console.log("Catalog manifest loaded successfully from network!");
        catalogData = manifest;
        renderCatalogFilters();
        if (catalogData.length > 0) {
            renderCatalogProducts(catalogData[0].key);
        }
    }).catch(err => {
        console.warn("Failed to load catalog manifest from network, falling back to embedded local copy:", err);
        catalogData = FALLBACK_CATALOG_DATA;
        renderCatalogFilters();
        if (catalogData.length > 0) {
            renderCatalogProducts(catalogData[0].key);
        }
    });

    // ==========================================
    // Lead Capture Logic
    // ==========================================
    const leadModal = document.getElementById('lead-modal');
    const leadForm = document.getElementById('lead-capture-form');
    const leadSubmitBtn = document.getElementById('lead-submit-btn');
    const minimizedLeadBtn = document.getElementById('minimized-lead-btn');

    // Display Logic
    if (leadModal && leadForm) {
        const hasCapturedLead = localStorage.getItem('leadCaptured');
        
        // Initial visibility check
        if (hasCapturedLead === 'true' && minimizedLeadBtn) {
            minimizedLeadBtn.classList.add('hidden');
        } else if (minimizedLeadBtn) {
            minimizedLeadBtn.classList.remove('hidden');
        }

        const closeLeadBtn = document.getElementById('close-lead-modal');

        const showLeadPopup = () => {
            const status = localStorage.getItem('leadCaptured');
            if (status === 'true') return;
            
            leadModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            if (minimizedLeadBtn) {
                minimizedLeadBtn.style.transform = 'translateX(-200%)';
                setTimeout(() => minimizedLeadBtn.classList.add('hidden'), 300);
            }
        };

        const showMinimizedBtn = () => {
            const status = localStorage.getItem('leadCaptured');
            if (status === 'true' || !minimizedLeadBtn) return;
            
            minimizedLeadBtn.classList.remove('hidden');
            setTimeout(() => {
                minimizedLeadBtn.style.transform = 'translateX(0)';
            }, 100);
        };

        // PERSISTENT TRIGGER: Removed auto-retrigger to improve UX as requested.
        // Users can still open it via the minimized button if they dismissed it.
        const leadTriggerInterval = null;

        // Initial Triggers
        if (!hasCapturedLead) {
            showMinimizedBtn();
            // Auto-triggers disabled to prevent blocking the user experience on load.
            // showLeadPopup(); 
        } else if (hasCapturedLead === 'dismissed') {
            showMinimizedBtn();
        }

        // Close Logic
        const closePopup = () => {
            leadModal.classList.remove('show');
            document.body.style.overflow = '';
            localStorage.setItem('leadCaptured', 'dismissed');
            showMinimizedBtn();
        };

        if (closeLeadBtn) {
            closeLeadBtn.addEventListener('click', (e) => {
                console.log("Close button clicked, hiding popup...");
                e.stopPropagation();
                closePopup();
            });
        }

        if (minimizedLeadBtn) {
            minimizedLeadBtn.addEventListener('click', () => {
                console.log("Discount button clicked, showing popup...");
                showLeadPopup();
            });
        }

        // Close on overlay click
        window.addEventListener('click', (e) => {
            if (e.target === leadModal) closePopup();
        });

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && leadModal.classList.contains('show')) closePopup();
        });

        // Handle Submission
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Track Lead Generation
            if (typeof fbq !== 'undefined') fbq('track', 'Lead');
            if (typeof gtag !== 'undefined') gtag('event', 'generate_lead');

            const name = document.getElementById('lead-name').value.trim();
            const phone = document.getElementById('lead-phone').value.trim();
            const location = document.getElementById('lead-location').value.trim();

            if (!name || !phone || !location) return;

            const originalText = leadSubmitBtn.innerHTML;
            leadSubmitBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Claiming...';
            leadSubmitBtn.disabled = true;

            const now = new Date();
            const data = {
                name: name,
                phone: "+91" + phone,
                location: location,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                source: 'Discount Popup'
            };

            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5Y_oIoec0Q5fBDKUbv_QXa6LN_BMzhvc1UmMywrwTnNmQtWDSo6u0igMuftcDdg13/exec';

            try {
                if (SCRIPT_URL) {
                    await fetch(SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                }
            } catch (error) {
                console.error("Error saving lead:", error);
            }

            localStorage.setItem('leadCaptured', 'true');
            leadModal.classList.remove('show');
            document.body.style.overflow = '';
            
            if (minimizedLeadBtn) {
                minimizedLeadBtn.style.transform = 'translateX(-200%)';
                setTimeout(() => minimizedLeadBtn.classList.add('hidden'), 300);
            }
            
            alert("Congratulations! Your 10% discount code has been sent to your WhatsApp.");

            leadSubmitBtn.innerHTML = originalText;
            leadSubmitBtn.disabled = false;
        });
    }

    // ==========================================
    // Review Product Click Navigation (Handled natively by HTML links)
    // ==========================================


    // ==========================================
    // Hero Section Product Navigation
    // ==========================================
    document.querySelectorAll('.minimal-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const title = card.querySelector('.minimal-title').textContent;
            const imgSrc = card.querySelector('.minimal-img').getAttribute('src');
            const cardPrice = card.querySelector('.minimal-price')?.textContent || '₹499';
            
            let foundCategory = "Products";
            let foundItem = {
                name: title,
                price: cardPrice,
                image: imgSrc
            };
            
            if (catalogData && catalogData.length > 0) {
                for (const cat of catalogData) {
                    const match = cat.images.find(img => img.includes(title.replace(/ /g, '_')) || title.toLowerCase().includes(img.split('/').pop().split('_')[0].toLowerCase()));
                    if (match) {
                        foundCategory = cat.title;
                        foundItem.image = match;
                        break;
                    }
                }
            }
            
            if (typeof window.openCatalogProductModal === 'function') {
                window.openCatalogProductModal(foundCategory, foundItem);
            }
        });
    });

    // ==========================================
    // Hero Slider Logic (5 Items) - Enhanced
    // ==========================================
    const sliderTrack = document.getElementById('slider-track');
    const sliderDots = document.querySelectorAll('.nav-dot');
    const heroSlider = document.getElementById('hero-slider');
    
    if (heroSlider && sliderTrack) {
        let currentSlide = 0;
        const totalSlides = sliderDots.length || 5;
        let autoSlideInterval;
        let isDragging = false;
        let startX;

        const updateSlider = (index) => {
            currentSlide = index;
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots
            sliderDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        };

        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateSlider(currentSlide);
            }, 4000); // 4 seconds for a more dynamic feel
        };

        const stopAutoSlide = () => {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        };

        // Dot Navigation
        sliderDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(dot.getAttribute('data-index'));
                updateSlider(index);
                startAutoSlide();
            });
        });

        // Drag / Swipe Support
        const handleDragStart = (e) => {
            isDragging = true;
            startX = (e.pageX || e.touches[0].pageX);
            stopAutoSlide();
        };

        const handleDragEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const endX = (e.pageX || e.changedTouches[0].pageX);
            if (endX === undefined) return; // For touch events sometimes changedTouches is tricky

            const diff = startX - endX;
            const threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    currentSlide = (currentSlide + 1) % totalSlides;
                } else {
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                }
                updateSlider(currentSlide);
            }
            startAutoSlide();
        };

        heroSlider.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mouseup', handleDragEnd); 
        
        heroSlider.addEventListener('touchstart', handleDragStart, { passive: true });
        heroSlider.addEventListener('touchend', handleDragEnd);

        // Hover pause
        heroSlider.addEventListener('mouseenter', stopAutoSlide);
        heroSlider.addEventListener('mouseleave', startAutoSlide);

        // Initialize
        // Initialize
        startAutoSlide();
    }

    // ==========================================
    // Advanced Shopping Cart Logic
    // ==========================================
    let cart = JSON.parse(localStorage.getItem('ss_cart')) || [];
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const cartCount = document.getElementById('cart-count');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsList = document.getElementById('cart-items-list');
    const totalQty = document.getElementById('total-qty');
    const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
    const amazonModalAddCart = document.getElementById('amazon-modal-add-cart');

    const saveCart = () => {
        localStorage.setItem('ss_cart', JSON.stringify(cart));
        updateCartUI();
    };

    const updateCartUI = () => {
        const total = cart.reduce((acc, item) => acc + item.qty, 0);
        console.log("Updating Cart UI. Total items:", total);
        
        if (cartCount) cartCount.textContent = total;
        if (totalQty) totalQty.textContent = total;
        
        // Update mobile bottom nav badge
        const mobileCartBadge = document.getElementById('mobile-cart-badge');
        if (mobileCartBadge) {
            mobileCartBadge.textContent = total;
            mobileCartBadge.style.display = total > 0 ? 'flex' : 'none';
            console.log("Mobile cart badge display state:", mobileCartBadge.style.display);
        }
        
        if (total > 0) {
            floatingCartBtn?.classList.remove('hidden');
        } else {
            floatingCartBtn?.classList.add('hidden');
        }
        
        renderCartItems();
    };

    const renderCartItems = () => {
        if (!cartItemsList) return;
        
        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="ph-fill ph-shopping-bag" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 1rem;"></i>
                    <p style="color: #94a3b8; font-weight: 500;">Your bag is empty.<br>Start adding some magic!</p>
                </div>`;
            return;
        }

        cartItemsList.innerHTML = cart.map((item, index) => `
            <div class="cart-item" style="display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid #f1f5f9; align-items: center; position: relative;">
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: #f8fafc;">
                <div class="cart-item-info" style="flex: 1;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 4px; color: var(--clr-blue); font-weight: 700;">${item.name}</h4>
                    <p style="color: #B12704; font-weight: 700; margin-bottom: 8px;">${item.price}</p>
                    <div class="cart-qty-controls" style="display: flex; align-items: center; gap: 12px; background: #f1f5f9; width: fit-content; padding: 4px 10px; border-radius: 20px;">
                        <button onclick="window.updateQty(${index}, -1)" style="background: none; border: none; cursor: pointer; color: #64748b; display: flex;"><i class="ph-bold ph-minus" style="font-size: 0.8rem;"></i></button>
                        <span style="font-weight: 700; font-size: 0.9rem; min-width: 15px; text-align: center;">${item.qty}</span>
                        <button onclick="window.updateQty(${index}, 1)" style="background: none; border: none; cursor: pointer; color: #64748b; display: flex;"><i class="ph-bold ph-plus" style="font-size: 0.8rem;"></i></button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="window.removeFromCart(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.6; transition: 0.2s;">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </div>
        `).join('');
    };

    window.addToCart = (product) => {
        const existing = cart.find(item => item.name === product.name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        saveCart();
        
        // Visual feedback
        if (amazonModalAddCart) {
            const original = amazonModalAddCart.innerHTML;
            amazonModalAddCart.innerHTML = '<i class="ph-bold ph-check"></i> Added!';
            amazonModalAddCart.style.background = '#10b981';
            amazonModalAddCart.style.color = 'white';
            setTimeout(() => {
                amazonModalAddCart.innerHTML = original;
                amazonModalAddCart.style.background = '';
                amazonModalAddCart.style.color = '';
            }, 2000);
        }
    };

    window.updateQty = (index, delta) => {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        saveCart();
    };

    window.toggleCart = () => {
        cartDrawer?.classList.toggle('open');
        if (cartDrawer?.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    floatingCartBtn?.addEventListener('click', toggleCart);
    closeCartBtn?.addEventListener('click', toggleCart);

    if (amazonModalAddCart) {
        amazonModalAddCart.addEventListener('click', () => {
            const title = document.getElementById('amazon-modal-title').textContent;
            const priceText = document.getElementById('amazon-modal-price').textContent;
            const imgSrc = document.getElementById('amazon-modal-img').src;
            
            window.addToCart({
                name: title,
                price: '₹' + priceText,
                image: imgSrc
            });
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            let waMessage = `✨ *SS MAGIC PRINTERS - BULK ORDER* ✨\n\nI want to order the following items:\n\n`;
            let total = 0;
            cart.forEach((item, i) => {
                waMessage += `${i+1}. *${item.name}* (Qty: ${item.qty}) - ${item.price}\n`;
                const p = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
                total += p * item.qty;
            });
            
            waMessage += `\n💰 *Estimated Total:* ₹${total}\n`;
            waMessage += `\n--- \nPlease share the final price and delivery details for my selection!`;
            
            const encoded = encodeURIComponent(waMessage);
            window.open(`https://wa.me/917731879736?text=${encoded}`, '_blank');
            toggleCart();
        });
    }

    // Initialize UI
    updateCartUI();

    // ==========================================
    // VIP Authentication Logic
    // ==========================================
    const authModal = document.getElementById('auth-modal');
    const openAuthBtn = document.getElementById('open-auth-btn');
    const closeAuthBtn = document.getElementById('close-auth-btn');
    const authForm = document.getElementById('auth-login-form');
    const authViewLogin = document.getElementById('auth-view-login');
    const authViewProfile = document.getElementById('auth-view-profile');
    const logoutBtn = document.getElementById('auth-logout-btn');

    const currentUser = JSON.parse(localStorage.getItem('ss_user')) || null;

    const updateAuthUI = () => {
        const user = JSON.parse(localStorage.getItem('ss_user'));
        if (user) {
            if (openAuthBtn) {
                openAuthBtn.innerHTML = `<i class="ph-bold ph-user-circle"></i> ${user.name.split(' ')[0]}`;
                openAuthBtn.style.background = 'var(--grad-gold)';
            }
            authViewLogin?.classList.add('hidden');
            authViewProfile?.classList.remove('hidden');
            
            // Update profile view
            if (document.getElementById('profile-name')) document.getElementById('profile-name').textContent = user.name;
            if (document.getElementById('profile-phone')) document.getElementById('profile-phone').textContent = user.phone;
            if (document.getElementById('profile-avatar')) document.getElementById('profile-avatar').textContent = user.name.charAt(0);
        } else {
            if (openAuthBtn) {
                openAuthBtn.innerHTML = 'Login';
                openAuthBtn.style.background = 'var(--clr-blue)';
            }
            authViewLogin?.classList.remove('hidden');
            authViewProfile?.classList.add('hidden');
        }
    };

    window.toggleAuthModal = () => {
        const modal = document.getElementById('auth-modal');
        modal?.classList.toggle('show');
        if (modal?.classList.contains('show')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    openAuthBtn?.addEventListener('click', window.toggleAuthModal);
    closeAuthBtn?.addEventListener('click', window.toggleAuthModal);

    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = authForm.querySelector('button');
        const originalContent = submitBtn.innerHTML;

        const nameInput = document.getElementById('auth-name');
        const phoneInput = document.getElementById('auth-phone');
        
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name || !phone) {
            alert("Please enter both Name and Phone number to join VIP.");
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Authenticating...';

            // Save to Supabase (Simple profiles table)
            if (supabase) {
                const { data, error } = await supabase
                    .from('profiles')
                    .upsert({ 
                        phone: phone, 
                        name: name, 
                        last_login: new Date().toISOString() 
                    }, { onConflict: 'phone' });
                
                if (error) {
                    console.error("Supabase sync error:", error);
                    // Continue even if Supabase fails for local experience
                }
            }

            // Save locally
            localStorage.setItem('ss_user', JSON.stringify({ name, phone }));
            updateAuthUI();
            
            // Success Feedback
            submitBtn.innerHTML = '<i class="ph-bold ph-check"></i> VIP Active!';
            submitBtn.style.background = '#10b981';
            
            setTimeout(() => {
                toggleAuthModal();
                submitBtn.innerHTML = originalContent;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 1000);

        } catch (err) {
            console.error("Auth error:", err);
            alert("An error occurred. Please try again.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    });

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('ss_user');
        updateAuthUI();
        window.toggleAuthModal();
    });

    // Initialize Auth UI
    updateAuthUI();

    // ==========================================
    // Intersection Observer for Reveal Animations
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================
    // Social Proof Sales Toast Logic
    // ==========================================
    const salesToast = document.getElementById('sales-toast');
    if (salesToast) {
        const toastNames = ['Ramesh', 'Suresh', 'Priya', 'Kavya', 'Gopal', 'Anitha', 'Karthik', 'Divya'];
        const toastLocations = ['Kurnool', 'Nandyal', 'Adoni', 'Dhone', 'Yemmiganur'];
        const toastProducts = [
            { name: 'Magic Mug', img: 'processed_images/mug_var_1_1771776757614.png' },
            { name: 'Custom T-Shirt', img: 'WhatsApp Image 2026-03-31 at 8.44.31 AM (1).jpeg' },
            { name: 'Spotify Acrylic Frame', img: 'WhatsApp Image 2026-03-31 at 8.44.01 AM.jpeg' },
            { name: 'LED Pentagon Lamp', img: 'WhatsApp Image 2026-03-31 at 8.47.57 AM.jpeg' },
            { name: 'Heart Photo Pillow', img: 'WhatsApp Image 2026-03-31 at 8.48.03 AM.jpeg' }
        ];

        function showRandomToast() {
            // Randomize Data
            const randName = toastNames[Math.floor(Math.random() * toastNames.length)];
            const randLoc = toastLocations[Math.floor(Math.random() * toastLocations.length)];
            const randProd = toastProducts[Math.floor(Math.random() * toastProducts.length)];
            
            // Update DOM
            document.getElementById('toast-name').textContent = randName;
            document.getElementById('toast-location').textContent = randLoc;
            document.getElementById('toast-product').textContent = randProd.name;
            document.getElementById('toast-img').src = randProd.img;
            
            // Random time
            const timeAgo = Math.floor(Math.random() * 59) + 1;
            document.getElementById('toast-time').textContent = `${timeAgo} min ago`;

            // Show Toast
            salesToast.classList.remove('hidden');
            // Force reflow
            void salesToast.offsetWidth;
            salesToast.classList.add('show');

            // Hide after 5 seconds
            setTimeout(() => {
                salesToast.classList.remove('show');
                setTimeout(() => salesToast.classList.add('hidden'), 500); // Wait for transition
            }, 5000);
        }

        // Initial delay before showing first toast (e.g., 10 seconds)
        setTimeout(() => {
            showRandomToast();
            // Then show a new toast every 25-45 seconds
            setInterval(() => {
                showRandomToast();
            }, Math.floor(Math.random() * 20000) + 25000);
        }, 10000);
    }

    // ==========================================
    // Multi-Location Map Switcher
    // ==========================================
    const btnMapShop1 = document.getElementById('btn-map-shop1');
    const btnMapShop2 = document.getElementById('btn-map-shop2');
    const iframeMapShop1 = document.getElementById('iframe-map-shop1');
    const iframeMapShop2 = document.getElementById('iframe-map-shop2');

    if (btnMapShop1 && btnMapShop2 && iframeMapShop1 && iframeMapShop2) {
        btnMapShop1.addEventListener('click', () => {
            // Activate Tab 1
            btnMapShop1.classList.add('active');
            btnMapShop1.style.background = 'var(--clr-blue)';
            btnMapShop1.style.color = 'white';
            btnMapShop1.style.fontWeight = '700';
            btnMapShop1.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
            
            // Deactivate Tab 2
            btnMapShop2.classList.remove('active');
            btnMapShop2.style.background = 'transparent';
            btnMapShop2.style.color = 'var(--clr-text-light)';
            btnMapShop2.style.fontWeight = '600';
            btnMapShop2.style.boxShadow = 'none';

            // Show Map 1, Hide Map 2
            iframeMapShop1.style.opacity = '1';
            iframeMapShop1.style.pointerEvents = 'auto';
            iframeMapShop2.style.opacity = '0';
            iframeMapShop2.style.pointerEvents = 'none';
        });

        btnMapShop2.addEventListener('click', () => {
            // Activate Tab 2
            btnMapShop2.classList.add('active');
            btnMapShop2.style.background = 'var(--clr-blue)';
            btnMapShop2.style.color = 'white';
            btnMapShop2.style.fontWeight = '700';
            btnMapShop2.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
            
            // Deactivate Tab 1
            btnMapShop1.classList.remove('active');
            btnMapShop1.style.background = 'transparent';
            btnMapShop1.style.color = 'var(--clr-text-light)';
            btnMapShop1.style.fontWeight = '600';
            btnMapShop1.style.boxShadow = 'none';

            // Show Map 2, Hide Map 1
            iframeMapShop2.style.opacity = '1';
            iframeMapShop2.style.pointerEvents = 'auto';
            iframeMapShop1.style.opacity = '0';
            iframeMapShop1.style.pointerEvents = 'none';
        });
    }
});

