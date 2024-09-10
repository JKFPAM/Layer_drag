let rectangle = document.getElementById('rectangle');
const container = document.querySelector('.container');
let isDragging = false;
let startX = 0, startY = 0;
let currentPosition = 'center';
let dragThreshold = 30;
let hoverTimeout;

function startDragging(event) {
    startX = event.clientX;
    startY = event.clientY;
    isDragging = true;
}

function onMouseMove(event) {
    if (isDragging) {
        let currentX = event.clientX;
        let currentY = event.clientY;
        let deltaX = currentX - startX;
        let deltaY = currentY - startY;

        if (deltaX > dragThreshold && currentPosition === 'center') {
            moveRectangle('right');
            currentPosition = 'right';
        } else if (deltaX < -dragThreshold && currentPosition === 'center') {
            moveRectangle('left');
            currentPosition = 'left';
        } else if (deltaY > dragThreshold && currentPosition === 'center') {
            moveRectangle('bottom');
            currentPosition = 'bottom';
        } else if (deltaY < -dragThreshold && currentPosition === 'center') {
            moveRectangle('top');
            currentPosition = 'top';
        }

        if (Math.abs(deltaX) < dragThreshold && Math.abs(deltaY) < dragThreshold && currentPosition !== 'center') {
            moveRectangle('center');
            currentPosition = 'center';
        }

        // Detect hover and promote underlays during dragging
        detectHoverEffect(event);
    }
}

function stopDragging() {
    isDragging = false;
    resetUnderlays(); // Reset all underlays when dragging stops
}

function moveRectangle(direction) {
    let transform = '';
    if (direction === 'right') {
        transform = 'translateX(30px) scale(0.9)';
        addUnderlay('right');
    } else if (direction === 'left') {
        transform = 'translateX(-30px) scale(0.9)';
        addUnderlay('left');
    } else if (direction === 'bottom') {
        transform = 'translateY(30px) scale(0.9)';
        addUnderlay('bottom');
    } else if (direction === 'top') {
        transform = 'translateY(-30px) scale(0.9)';
        addUnderlay('top');
    } else if (direction === 'center') {
        transform = 'translate(0, 0) scale(1)';
        removeAllUnderlays();
    }
    rectangle.style.transform = transform;
}

function addUnderlay(direction) {
    let baseOffset = 90;
    let offsetIncrement = 30;
    let baseColor = 220;
    let colorDecrement = 15;
    let scaleFactor = 0.7; // Initial scale factor for the first underlay
    let scaleDecrement = 0.05; // Decrease in scale factor for each subsequent underlay

    for (let i = 0; i < 10; i++) {
        let currentOffset = baseOffset + (i * offsetIncrement);
        let currentColorValue = baseColor - (i * colorDecrement);
        let currentColor = `rgb(${currentColorValue}, ${currentColorValue}, ${currentColorValue})`;

        const underlay = document.createElement('div');
        underlay.classList.add('underlay');
        underlay.style.zIndex = -i;
        underlay.dataset.originalZIndex = -i;
        underlay.style.backgroundColor = currentColor;
        underlay.dataset.direction = direction;
        underlay.style.pointerEvents = 'auto';

        // Apply scaling progressively by reducing the scale factor with each layer
        let scaleValue = scaleFactor - (i * scaleDecrement);

        // Set the transform for each direction with the scaled size
        if (direction === 'right') {
            underlay.style.transform = `translate(calc(-50% + ${currentOffset}px), -50%) scale(${scaleValue})`;
        } else if (direction === 'left') {
            underlay.style.transform = `translate(calc(-50% + ${-currentOffset}px), -50%) scale(${scaleValue})`;
        } else if (direction === 'bottom') {
            underlay.style.transform = `translate(-50%, calc(-50% + ${currentOffset}px)) scale(${scaleValue})`;
        } else if (direction === 'top') {
            underlay.style.transform = `translate(-50%, calc(-50% + ${-currentOffset}px)) scale(${scaleValue})`;
        }

        container.appendChild(underlay);
    }
}


function promoteToTop(targetUnderlay) {
    const direction = targetUnderlay.dataset.direction;
    let currentTransform = targetUnderlay.style.transform || "";

    if (direction === 'right' && !currentTransform.includes('translateX(50px)')) {
        targetUnderlay.style.transform = currentTransform + ' translateX(50px)';
    } else if (direction === 'left' && !currentTransform.includes('translateX(-50px)')) {
        targetUnderlay.style.transform = currentTransform + ' translateX(-50px)';
    } else if (direction === 'bottom' && !currentTransform.includes('translateY(50px)')) {
        targetUnderlay.style.transform = currentTransform + ' translateY(50px)';
    } else if (direction === 'top' && !currentTransform.includes('translateY(-50px)')) {
        targetUnderlay.style.transform = currentTransform + ' translateY(-50px)';
    }

    let moveDistance = 40;
    let startMoving = false;
    const underlays = document.querySelectorAll('.underlay');
    underlays.forEach(underlay => {
        if (underlay === targetUnderlay) {
            startMoving = true;
        } else if (startMoving && underlay.dataset.direction === direction) {
            let transform = underlay.style.transform || '';
            if (direction === 'right') {
                underlay.style.transform = transform + ` translateX(${moveDistance}px)`;
            } else if (direction === 'left') {
                underlay.style.transform = transform + ` translateX(-${moveDistance}px)`;
            } else if (direction === 'bottom') {
                underlay.style.transform = transform + ` translateY(${moveDistance}px)`;
            } else if (direction === 'top') {
                underlay.style.transform = transform + ` translateY(-${moveDistance}px)`;
            }
        }
    });
}

function detectHoverEffect(event) {
    let highestZIndexUnderlay = null;
    const underlays = document.querySelectorAll('.underlay');
    underlays.forEach(underlay => {
        const rect = underlay.getBoundingClientRect();
        if (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        ) {
            if (!highestZIndexUnderlay || parseInt(underlay.style.zIndex) > parseInt(highestZIndexUnderlay.style.zIndex)) {
                highestZIndexUnderlay = underlay;
            }
        }
    });

    underlays.forEach(underlay => {
        underlay.style.transform = underlay.style.transform.replace(/translate[XY]\(.*?\)/g, '');
    });

    if (highestZIndexUnderlay) {
        promoteToTop(highestZIndexUnderlay);

        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            moveUnderlayFurther(highestZIndexUnderlay);
        }, 1000);
    } else {
        clearTimeout(hoverTimeout);
    }
}

function moveUnderlayFurther(targetUnderlay) {
    const direction = targetUnderlay.dataset.direction;
    let currentTransform = targetUnderlay.style.transform || "";

    if (direction === 'right') {
        targetUnderlay.style.transform = currentTransform + ' translateX(150px)';
    } else if (direction === 'left') {
        targetUnderlay.style.transform = currentTransform + ' translateX(-150px)';
    } else if (direction === 'bottom') {
        targetUnderlay.style.transform = currentTransform + ' translateY(150px)';
    } else if (direction === 'top') {
        targetUnderlay.style.transform = currentTransform + ' translateY(-150px)';
    }

    // Move the underlay to the center of the page after 2 seconds
    setTimeout(() => {
        moveUnderlayToCenter(targetUnderlay);
    }, 1000);
}

function moveUnderlayToCenter(targetUnderlay) {
    // Get the size of the main rectangle to match the underlay's size with it
    let mainRectangle = document.getElementById('rectangle');
    let mainRectangleStyles = window.getComputedStyle(mainRectangle);
    let mainRectangleWidth = mainRectangleStyles.width;
    let mainRectangleHeight = mainRectangleStyles.height;
    let mainRectangleZIndex = mainRectangleStyles.zIndex;

    // Set the underlay to the same size as the main rectangle
    targetUnderlay.style.width = mainRectangleWidth;
    targetUnderlay.style.height = mainRectangleHeight;

    // Center the underlay by setting its transform to center position
    targetUnderlay.style.transform = 'translate(-50%, -50%)';
    targetUnderlay.style.position = 'fixed'; // Ensure it is positioned relative to the viewport
    targetUnderlay.style.top = '50%';
    targetUnderlay.style.left = '50%';

    // Ensure the underlay is above the main rectangle
    targetUnderlay.style.zIndex = parseInt(mainRectangleZIndex) + 1; 

    // Smoothly animate the movement and scaling
    targetUnderlay.style.transition = 'transform 0.5s ease, top 0.5s ease, left 0.5s ease, width 0.5s ease, height 0.5s ease'; // Smooth transition
}



function resetUnderlays() {
    const underlays = document.querySelectorAll('.underlay');
    underlays.forEach(underlay => {
        underlay.style.transform = ''; // Reset transform to the original state
    });
}

function removeAllUnderlays() {
    const underlays = document.querySelectorAll('.underlay');
    underlays.forEach(underlay => {
        underlay.remove();
    });
}

rectangle.addEventListener('mousedown', startDragging);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', stopDragging);
