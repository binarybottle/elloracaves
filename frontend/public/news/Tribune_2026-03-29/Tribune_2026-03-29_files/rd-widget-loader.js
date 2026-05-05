/**
 * Readwhere Digital Widget Loader
 * This script loads widgets from the API and injects them into specified DOM elements.
 */
(function() {
  // Widget configuration

  let scriptUrl = document.currentScript.src;
  let baseFullUrl = new URL(scriptUrl);
  let api_url = baseFullUrl.origin;
 
  const config = {
    // Updated paths to use the new widgetsdata endpoints
    baseUrl: api_url+'/widgetsdata',
    quizContainerId: 'rd_ai_quiz',
    summaryContainerId: 'rd_ai_summary',
    pollContainerId: 'rd_ai_poll',
    keyTakeawaysContainerId: 'rd_ai_keytakeaways',
    homeShortsWidgetContainerId:'homes_shorts_icon_widget',
    latestPodcastContainerId:'rd_ai_latest_podcast',
    articlePodcastContainerId:'rd_ai_article_podcast',
    scrollableShortsId: 'rd_scrollable_shorts', // Container ID for scrollable shorts
    storageKeyPrefix: 'rd_widget_'
  };
  
  // Helper functions
  const helpers = {
    getCurrentUrl: function() {
      // Get URL from query parameter 'url'
      const urlParams = new URLSearchParams(window.location.search);
      const paramUrl = urlParams.get('url');
      
      if (paramUrl) {
        return paramUrl;
      }
      
      // Fallback to current page URL if no 'url' parameter
      return window.location.href;
      
    },

    // Extract category from URL
    getCategoryFromUrl: function() {
      try {
        const currentUrl = window.location.href;
        const urlObj = new URL(currentUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        
        // For URLs like /politics/article-title, the first segment is the category
        if (pathSegments.length > 0) {
          return pathSegments[0];
        }
        
        return '';
      } catch (e) {
        console.error('Error extracting category from URL:', e);
        return '';
      }
    },
    
    // Detect if the device is mobile
    isMobile: function() {
      return window.innerWidth <= 768;
    },
    
    // Create element with specified attributes
    createElementWithAttributes: function(tag, attributes = {}) {
      const element = document.createElement(tag);
      Object.keys(attributes).forEach(key => {
        if (key === 'style' && typeof attributes[key] === 'object') {
          Object.keys(attributes[key]).forEach(styleKey => {
            element.style[styleKey] = attributes[key][styleKey];
          });
        } else if (key === 'textContent') {
          element.textContent = attributes[key];
        } else if (key === 'innerHTML') {
          element.innerHTML = attributes[key];
        } else {
          element.setAttribute(key, attributes[key]);
        }
      });
      return element;
    },
    
    // Attach event handlers for quiz widget
    attachQuizEvents: function(container) {
      console.log('Attaching quiz events');

      // Get elements
      const optionItems = container.querySelectorAll('.option-item');
      const submitButton = container.querySelector('#submit-quiz-btn');
      const resultsArea = container.querySelector('#quiz-results-area');
      
      if (!optionItems.length || !submitButton) {
        console.error('Quiz elements not found in the container');
        return;
      }

      submitButton.style.pointerEvents = 'none';
      submitButton.style.opacity = '0.5';
      
      
      let selectedOption = null;
      
      // Add event listeners to options
      optionItems.forEach((option, index) => {
        option.addEventListener('click', function() {
          // Update selected state
          optionItems.forEach(opt => {
            opt.classList.remove('selected');
            // Reset option content to only show text
            const optionText = opt.querySelector('.div')?.textContent || '';
            opt.innerHTML = `<div class="div">${optionText}</div>`;
          });

          submitButton.style.pointerEvents = '';
          submitButton.style.opacity = '';
          
          // Add selected class
          this.classList.add('selected');
          
          // Add tick icon to selected option
          const optionText = this.querySelector('.div')?.textContent || '';
          this.innerHTML = `
            <div class="cliparticonsuiactiontick">
              <div class="cliparticonscontainerblank">
                <div class="cliparticonscontainerblank"></div>
              </div>
              <svg class="tick-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z" fill="white"/>
              </svg>
            </div>
            <div class="div">${optionText}</div>
          `;
          
          selectedOption = index;
        });
      });


      // Submit button event listener
      submitButton.addEventListener('click', function() {
        if (selectedOption === null) return;
        
        // Extract data attributes from container
        const quizId = container.getAttribute('data-quiz-id');
        const questionId = container.getAttribute('data-question-id');
        const correctAnswer = parseInt(container.getAttribute('data-correct-answer') || '0');
        
        if (!quizId || !questionId) {
          console.error('Missing quiz or question ID in container');
          return;
        }
        
        // Display the results immediately
        const isCorrect = selectedOption === correctAnswer;
        
        // Update options styling based on correctness
        optionItems.forEach((option, index) => {
          const isSelected = index === selectedOption;
          const isCorrectAnswer = index === correctAnswer;
          
          if (isSelected && isCorrect) {
            option.style.border = '1px solid #00aa00';
            option.style.backgroundColor = 'rgba(39, 215, 71, 0.19)';
            option.querySelector('.tick-icon').style.backgroundColor = ' #00aa00';
            option.querySelector('.tick-icon').style.borderRadius = '100px';
          } else if (isSelected && !isCorrect) {
            option.style.border = '1px solid #aa0000';
            option.style.backgroundColor = 'rgba(255, 0, 0, 0.19)';
            option.querySelector('.tick-icon').style.display = 'none'; 
            const img = document.createElement('img');
            img.src = 'https://engage.sortd.mobi/images/close.svg';
            img.classList.add('cliparticonsuiactionclose');
            option.append(img);
          } else if (isCorrectAnswer) {
            option.style.border = '1px solid #00aa00';
            option.style.backgroundColor = 'rgba(39, 215, 71, 0.19)';
          }
        });
        
        // Show result text
        if (resultsArea) {
          const resultText = isCorrect ? 
            'Correct Answer!' : 
            'Wrong answer, the correct answer is:' + optionItems[correctAnswer].querySelector('.div').textContent;
            
          resultsArea.textContent = resultText;
          resultsArea.style.display = 'block';
          resultsArea.style.color = isCorrect ? '#00aa00' : '#aa0000';
          resultsArea.style.fontWeight = 'bold';
          resultsArea.style.marginTop = '10px';
        }
        
        // Disable further clicks
        optionItems.forEach(opt => {
          opt.style.pointerEvents = 'none';
        });
        submitButton.style.opacity = '0.5';
        submitButton.style.pointerEvents = 'none';
        
        // Store the answer in local storage
        const storageKey = `${config.storageKeyPrefix}quiz_${quizId}_${questionId}`;
        // Add expiration time - one hour from now
        const storageData = {
          answer: selectedOption,
          expiry: Date.now() + (60 * 60 * 1000) // 1 hour in milliseconds
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));
        
        triggerGAEvent('quiz_submit','aiengagement','AI Quiz Submit',quizId);

      });
    },

    // Attach event handlers for poll widget
    attachPollEvents: function(container) {
      console.log('Attaching poll events');
      
      // Get elements
      const optionItems = container.querySelectorAll('.option-item');
      const submitButton = container.querySelector('#submit-poll-btn');
      
      if (!optionItems.length || !submitButton) {
        console.error('Poll elements not found in the container');
        return;
      }

      const storedAnswer = this.checkPollLocalStorage(container);
      
      let selectedOption = null;
      
      // Add event listeners to options
      optionItems.forEach((option, index) => {
        option.addEventListener('click', function() {
          // Update selected state
          optionItems.forEach(opt => {
            opt.classList.remove('selected');
            // Reset option content to only show text
            const optionText = opt.querySelector('.div')?.textContent || '';
            opt.innerHTML = `<div class="div">${optionText}</div>`;
          });
          
          // Add selected class
          this.classList.add('selected');
          
          // Add tick icon to selected option
          const optionText = this.querySelector('.div')?.textContent || '';
          this.innerHTML = `
            <div class="cliparticonsuiactiontick">
              <div class="cliparticonscontainerblank">
                <div class="cliparticonscontainerblank"></div>
              </div>
              <svg class="tick-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z" fill="white"/>
              </svg>
            </div>
            <div class="div">${optionText}</div>
          `;
          
          selectedOption = index;
        });
      });

      if (storedAnswer !== null) {
        submitButton.style.pointerEvents = 'none';
        submitButton.style.opacity = '0.5';
        // Disable further clicks
        
        optionItems.forEach((option, index) => {
          if(index==storedAnswer){
            option.classList.add('selected');
            // Add tick icon to selected option
            const optionText = option.querySelector('.div')?.textContent || '';
            option.innerHTML = `
              <div class="cliparticonsuiactiontick">
                <div class="cliparticonscontainerblank">
                  <div class="cliparticonscontainerblank"></div>
                </div>
                <svg class="tick-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z" fill="white"/>
                </svg>
              </div>
              <div class="div">${optionText}</div>
            `;
          }
          option.style.pointerEvents = 'none';
        })
      }

      const voteButton = document.getElementById('vote_button');
     
      voteButton.addEventListener('click', function() {
        let resultContainer = document.querySelector('.stateresults');
          resultContainer.style.display = 'none';
          document.getElementById('rd-poll-widget-content').style.display = 'flex';
          document.getElementById('rd-poll-widget-content').scrollIntoView({ behavior: 'smooth' });
      });

      const pollResults = container.querySelector('#show_poll_results');

      pollResults.addEventListener('click', function() {
        document.getElementById('rd-poll-widget-content').style.display = 'none';
          
          const options = document.querySelectorAll('.statepoll .option-item');
            let total_votes = 0;
            options.forEach(option => {
              const index = option.getAttribute('data-option-index');
              const voteCount = Number(option.getAttribute('data-option-count'));
              total_votes += voteCount;
            });
          
  
          let resultHtml = ``;
    let language = container.getAttribute('data-language');
          
              options.forEach(option => {
                let voteCount = option.getAttribute('data-option-count');
                let optionText = option.getAttribute('data-option-text');
                let index = option.getAttribute('data-option-index');
                if(selectedOption==index){
                  console.log(selectedOption);
                  voteCount =  Number(voteCount)+1;
                }
                
                //const percentage = total_votes > 0 ? Math.round((voteCount / total_votes) * 100) : 0;
                const percentage = total_votes > 0 ? parseFloat(((voteCount / total_votes) * 100).toFixed(2)) : 0;
                 let prefixes = ['1','2','3','4'];
                if(language=='ar'){
                  prefixes = ['أ', 'ب', 'ج', 'د'];
                }

                resultHtml += ` 
                  <div class="frame-parent">
                    <div class="parent">
                      <div class="div1">${prefixes[index]}. ${optionText}</div>
                      <div class="div">(${percentage}%)</div>
                    </div>
                    <div class="rectangle-parent" style="width:100%">
                      <div class="group-child"></div>
                      <div class="group-item" style="width: ${percentage}%;"></div>
                    </div>
                  </div>
                `;
              });

          
              
    
          document.getElementById('poll_options_result').innerHTML = resultHtml;      
              
          if (storedAnswer !== null) {
            voteButton.style.display = 'none';
          }

          const resultsContainer = document.querySelector('.stateresults');
          resultsContainer.style.display = 'flex';
      });

      
      // Submit button event listener
      submitButton.addEventListener('click', function() {
        if (selectedOption === null) return;

        if (storedAnswer !== null) return;
        
        // Extract data attributes from container
        const pollId = container.getAttribute('data-poll-id');

        let language = container.getAttribute('data-language');
        
        if (!pollId) {
          console.error('Missing poll ID in container');
          return;
        }
        
        // Submit the poll answer
        const apiUrl = `${config.baseUrl}/submit-poll-answer`;
        
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pollId,
            selectedOption
          })
        })
        .then(response => response.json())
        .then(data => {
          // Load results view
          
          
          document.getElementById('rd-poll-widget-content').style.display = 'none';
          
          const options = document.querySelectorAll('.statepoll .option-item');
            let total_votes = 1;
            options.forEach(option => {
              const index = option.getAttribute('data-option-index');
              const voteCount = Number(option.getAttribute('data-option-count'));
              total_votes += voteCount;
            });
          
  
          let resultHtml = ``;
    
          
              options.forEach(option => {
                let voteCount = option.getAttribute('data-option-count');
                let optionText = option.getAttribute('data-option-text');
                let index = option.getAttribute('data-option-index');
                if(selectedOption==index){
                  console.log(selectedOption);
                  voteCount =  Number(voteCount)+1;
                }
                console.log(voteCount);
                //const percentage = total_votes > 0 ? Math.round((voteCount / total_votes) * 100) : 0;
                const percentage = total_votes > 0 ? parseFloat(((voteCount / total_votes) * 100).toFixed(2)) : 0;
                
                let prefixes = ['1','2','3','4'];
                if(language=='ar'){
                  prefixes = ['أ', 'ب', 'ج', 'د'];
                }
                

                resultHtml += ` 
                  <div class="frame-parent">
                    <div class="parent">
                      <div class="div1">${prefixes[index]}. ${optionText}</div>
                      <div class="div">(${percentage}%)</div>
                    </div>
                    <div class="rectangle-parent" style="width:100%">
                      <div class="group-child"></div>
                      <div class="group-item" style="width: ${percentage}%;"></div>
                    </div>
                  </div>
                `;

                option.style.pointerEvents = 'none';
              });
              
    
          document.getElementById('poll_options_result').innerHTML = resultHtml;      
    
          const resultsContainer = document.querySelector('.stateresults');
          resultsContainer.style.display = 'flex';

          document.getElementById('vote_button').style.display = 'none';
          
        })
        .catch(error => {
          console.error('Error submitting poll:', error);
        });

        submitButton.style.pointerEvents = 'none';
        submitButton.style.opacity = '0.5';
        // Store the answer in local storage
        const storageKey = `${config.storageKeyPrefix}poll_${pollId}`;
        // Add expiration time - one hour from now
        const storageData = {
          answer: selectedOption,
          expiry: Date.now() + (60 * 60 * 72000) // 72 hour in milliseconds
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));
        
        triggerGAEvent('poll_submit','aiengagement','AI Poll Submit',pollId);
        

      });

      if (storedAnswer !== null) {
          pollResults.click();
      }
    },

   
    
    // Attach event handlers for summary widget
    attachSummaryEvents: function(container) {
      console.log('Attaching summary events');
      
      // Elements already exist in the DOM since all states are in one HTML response
      const defaultState = container.querySelector('#rd-summary-default');
      const generatingState = container.querySelector('#rd-summary-generating');
      const contentState = container.querySelector('#rd-summary-content');
      
      if (!defaultState || !generatingState || !contentState) {
        console.error('Summary elements not found in the container');
        return;
      }
      
      // When the default button is clicked, hide it and show the generating state
      defaultState.addEventListener('click', function() {

        // const content = document.querySelector('.rd-summary-content-body');
        // if (content.style.display === 'none' || content.style.display === '') {
        //   content.style.display = 'block';
        // } else {
        //   content.style.display = 'none';
        // }

        // defaultState.style.display = 'none';
        // generatingState.style.display = 'block';
        
        // // Simulate generation delay (in a real app, this would be an API call)
        // setTimeout(function() {
        //   generatingState.style.display = 'none';
        //   contentState.style.display = 'block';
        // }, 500);

        // triggerGAEvent('summary_generate','aiengagement','AI Summary Generate','');

      });

      contentState.addEventListener('click', function() {
        // const content = document.querySelector('.rd-summary-content-body');
        // if (content.style.display === 'none' || content.style.display === '') {
        //   content.style.display = 'block';
        // } else {
        //   content.style.display = 'none';
        // }
        
        //triggerGAEvent('summary_hide','aiengagement','AI Summary Hide','');

      });
    },

    // Check if quiz answer is in local storage
    checkPollLocalStorage: function(container) {
      // Extract data attributes from container
      const pollId = container.getAttribute('data-poll-id');
      
      if (!pollId) {
        return null;
      }
      
      // Check local storage for saved answer
      const storageKey = `${config.storageKeyPrefix}poll_${pollId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        return null;
      }
      
      try {
        const data = JSON.parse(storedData);
        
        // Check if the stored data has expired
        if (data.expiry && data.expiry < Date.now()) {
          localStorage.removeItem(storageKey);
          return null;
        }
        
        return data.answer;
      } catch (e) {
        console.error('Error parsing stored poll answer:', e);
        return null;
      }
    },
    
    // Check if quiz answer is in local storage
    checkQuizLocalStorage: function(container) {
      // Extract data attributes from container
      const quizId = container.getAttribute('data-quiz-id');
      const questionId = container.getAttribute('data-question-id');
      
      if (!quizId || !questionId) {
        return null;
      }
      
      // Check local storage for saved answer
      const storageKey = `${config.storageKeyPrefix}quiz_${quizId}_${questionId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        return null;
      }
      
      try {
        const data = JSON.parse(storedData);
        
        // Check if the stored data has expired
        if (data.expiry && data.expiry < Date.now()) {
          localStorage.removeItem(storageKey);
          return null;
        }
        
        return data.answer;
      } catch (e) {
        console.error('Error parsing stored quiz answer:', e);
        return null;
      }
    },

    loadArticleShortsWidget: function(container) {

      let shortsWidgetHtml = `<style>
      #article_shorts_icon_widget{
        position: fixed;
        bottom: 12px;
        left: 4%;
        width: 133px;
        z-index: 99;
        height: 44px;
        overflow: hidden;
        border-radius: 200px;
      }
          #article_shorts_icon_widget{
            .readshort_shortcut {
                font-family: 'Arial';
                background: #0179c8;
                width: 100%;
                float: left;
                border-radius: 100px;
                padding: 2px;
                overflow: hidden;
                display: block;
                position:absolute;
                top:0px;
                left:0px;
            }

            .readshort_icon {
                width: 26px;
                float: left;
                margin: 7px 0px 7px 14px;
            }

            .readshort_text {
                float: left;
                color: #fff;
                font-weight: 600;
                line-height: 39px;
                margin: 0% 0% 0% 0%;
                font-size: 1.0em;
                text-align: center;
                width: 66%;
            }

           .readshort_shortcut2 {
                background: #000;
                float: left;
                border-radius: 100px;
                padding: 0px;
                overflow: hidden;
                cursor: pointer;
                display: block;
                position: absolute;
                left: 2px;
                top: 2px;
            }
          .gradient_border1 {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 80%;
                height: 2px;
                background: linear-gradient(to right, transparent, #0179c8, transparent);
          }
            .gradient_border2{
              position: absolute;
              bottom: 0px;
              right: 0px;
              width: 80%;
              height: 2px;
              background: linear-gradient(to right, transparent, #0179c8, transparent);
            }
            

            @keyframes slideFadeOutLeft {
              0% {
                transform: translateX(0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translateX(-100%) scale(0.8);
                opacity: 0;
              }
            }

            .slide-fade-out-left {
              animation: slideFadeOutLeft 0.6s ease-in-out forwards;
            }
            }
            </style>

            <div class="readshort_shortcut">
                <span class="gradient_border1"> </span>
                <img class="readshort_icon" src="https://engage.sortd.mobi/images/shorts-icon.png">
                <span class="readshort_text">Shorts</span>
               <span class="gradient_border2"> </span>
            </div>
            `;
            container.innerHTML = shortsWidgetHtml;

            const shortcut2 = document.querySelector('.readshort_shortcut');

            // Step 2: On click of .readshort_shortcut2
            shortcut2.addEventListener('click', function() {
                window.location.href = api_url;
            });
    },
    
    loadHomeShortsWidget: function(containerId) {

      const container = document.getElementById(containerId);
      let shortsWidgetHtml = `<style>
            .readshort_shortcut {
                background: #000;
                width: 100%;
                float: left;
                border-radius: 100px;
                padding: 2px;
                overflow: hidden;
                display: block;
                position:absolute;
                top:0px;
                left:0px;
            }

            .readshort_icon {
                width: 40px;
                float: left;
            }

            .readshort_text {
                float: left;
                color: #fff;
                font-weight: 600;
                line-height: 39px;
                margin: 0% 0% 0% 0%;
                font-size: 1.0em;
                text-align: center;
                width: 66%;
            }

           .readshort_shortcut2 {
                background: #000;
                float: left;
                border-radius: 100px;
                padding: 0px;
                overflow: hidden;
                cursor: pointer;
                display: block;
                position: absolute;
                left: 2px;
                top: 2px;
            }
          .gradient_border1 {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 80%;
                height: 2px;
                background: linear-gradient(to right, transparent, #B21E21, transparent);
          }
            .gradient_border2{
              position: absolute;
              bottom: 0px;
              right: 0px;
              width: 80%;
              height: 2px;
              background: linear-gradient(to right, transparent, #B21E21, transparent);
            }
            #home_shorts_icon_widget {
                position: fixed;
                bottom: 12px;
                left: 4%;
                width: 133px;
                z-index: 99;
                height:44px;
                overflow: hidden;
                border-radius: 200px;
            }

            @keyframes slideFadeOutLeft {
              0% {
                transform: translateX(0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translateX(-100%) scale(0.8);
                opacity: 0;
              }
            }

            .slide-fade-out-left {
              animation: slideFadeOutLeft 0.6s ease-in-out forwards;
            }
            </style>

            <div class="readshort_shortcut2">
                <img class="readshort_icon" src="https://engage.sortd.mobi/images/shorts-icon.png">
            </div>

            <div class="readshort_shortcut">
              <span class="gradient_border1"> </span>
                <img class="readshort_icon" src="https://engage.sortd.mobi/images/shorts-icon.png">
                <span class="readshort_text">Shorts</span>
               <span class="gradient_border2"> </span>
            </div>
            `;
            container.innerHTML = shortsWidgetHtml;

            const shortcut = document.querySelector('.readshort_shortcut');
            const shortcut2 = document.querySelector('.readshort_shortcut2');

            // Step 2: On click of .readshort_shortcut2
            shortcut2.addEventListener('click', function() {
                shortcut.style.display = 'block';
                shortcut2.style.display = 'none';
            });

            // Step 3: On click of .readshort_shortcut
            shortcut.addEventListener('click', function() {
                window.location.href = api_url;
                // Show .readshort_shortcut2 and hide .readshort_shortcut (after redirect won't be visible though)
                shortcut2.style.display = 'block';
                shortcut.style.display = 'none';
                triggerGAEvent('shorts_widget_click','aiengagement','AI Shorts Widget Click','');
            });

            if(document.getElementById('breaking-news-notification')){
              let height = document.getElementById('breaking-news-notification').offsetHeight;
              document.getElementById('home_shorts_icon_widget').style.bottom=(height+12)+'px';
            }

            if(document.getElementById('breaking-news-notification')){
              document.querySelector('footer').style.marginBottom = '100px';
            }

            window.addEventListener('DOMContentLoaded', () => {

              setTimeout(() => {
                const mainIcon = document.querySelector('.readshort_shortcut');
                const altIcon = document.querySelector('.readshort_shortcut2');

                // Start the fold animation
                mainIcon.classList.add('slide-fade-out-left');

                // After animation completes, hide main and show alternate
                altIcon.style.display = 'block';
                setTimeout(() => {
                  mainIcon.style.display = 'none';
                }, 2500); // Duration of the CSS animation
              }, 5000); // Delay before animation starts (5 seconds)
            });
    },
    
    loadWidget: function(widgetType, containerId, params = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Build URL with query parameters
      const url = params.url || this.getCurrentUrl();
      
      // Add the URL parameter to params object if not already there and not shorts
      if (!params.url && widgetType !== 'shorts') {
        params.url = url;
      }
      
      // Add category parameter for shorts widget
      if (widgetType === 'shorts') {
        const category = this.getCategoryFromUrl();
        if (category) {
          params.category = category;
          //params.category = 'art';
        }
      }
      
      // Add device type to params
      params.isMobile = helpers.isMobile() ? '1' : '0';

      // if(widgetType === 'shorts'){
        
      //   if(!document.getElementById('article_shorts_icon_widget')){
      //     const newDiv = document.createElement('div');
      //     newDiv.id = "article_shorts_icon_widget";
      //     // Insert before the target div
      //     container.parentNode.insertBefore(newDiv, container);
      //     this.loadArticleShortsWidget(newDiv);
      //   }
       

      //   const breakingNews = document.getElementById('breaking-news-notification');
        
      //   if (breakingNews) {
      //     const height = breakingNews.offsetHeight;
      //     document.getElementById('article_shorts_icon_widget').style.bottom=(12+height)+'px';
      //   } 

      //   return;
      // }

      
      const queryParams = new URLSearchParams(params);
      
      // Map widget types to the new endpoint paths
      const endpointMap = {
        'quiz': 'getarticlequiz',
        'poll': 'getarticlepoll',
        'summary': 'getarticlesummary',
        'keytakeaways': 'getarticlekeytakeaways',
        'shorts': 'getarticleshorts',
        'latestpodcast': 'getlatestpodcast',
        'articlepodcast': 'getarticlepodcast'
      };
      
      // Use the mapped endpoint
      const endpoint = endpointMap[widgetType] || widgetType;
      const apiUrl = `${config.baseUrl}/${endpoint}?${queryParams.toString()}`;
      
      // Fetch widget HTML from API
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load widget');
          }
          return response.text();
        })
        .then(html => {
          // If the response is empty (widget not available for this article)
          // do nothing - just leave the container empty
          if (!html.trim()) {
            container.innerHTML = '';
            return;
          }
          
          // Otherwise update the container with the response HTML
          container.innerHTML = html;
          
          // Attach event handlers based on widget type
          if (widgetType === 'quiz') {
            const quizContainer = container.querySelector('.statequiz');
            if (quizContainer) {
              // Check if there's a stored answer
              const storedAnswer = this.checkQuizLocalStorage(quizContainer);
              if (storedAnswer !== null) {
                // Simulate a click on the stored option
                const options = quizContainer.querySelectorAll('.option-item');
                if (options[storedAnswer]) {
                  this.attachQuizEvents(quizContainer);
                  options[storedAnswer].click();
                  // Trigger the submit button
                  const submitButton = quizContainer.querySelector('#submit-quiz-btn');
                  if (submitButton) {
                    submitButton.click();
                  }
                }
              } else {
                this.attachQuizEvents(quizContainer);
              }
              triggerGAEvent('quiz_view','aiengagement','AI Quiz View',url);
            }
            const pollContainer = container.querySelector('.statepoll');
            if(pollContainer){
              this.attachPollEvents(pollContainer);
              triggerGAEvent('poll_view','aiengagement','AI Poll View',url);
            }
            
          } else if (widgetType === 'summary') {
            this.attachSummaryEvents(container);
            triggerGAEvent('summary_view','aiengagement','AI Summary View',url);
          }else if(widgetType === 'poll'){
            const pollContainer = container.querySelector('.statepoll');
            if(pollContainer){
              this.attachPollEvents(pollContainer);
              triggerGAEvent('poll_view','aiengagement','AI Poll View',url);
            }
          }else if(widgetType === 'shorts'){
            triggerGAEvent('infocus_widget_view','aiengagement','AI InFocus Widget View',url);
            
            if(!document.getElementById('article_shorts_icon_widget')){
              const newDiv = document.createElement('div');
              newDiv.id = "article_shorts_icon_widget";
              // Insert before the target div
              container.parentNode.insertBefore(newDiv, container);
              this.loadArticleShortsWidget(newDiv);
            }
           

              const inFocus = document.getElementById('infocus_rw');
              const breakingNews = document.getElementById('breaking-news-notification');
            
              if (breakingNews) {
                const height = breakingNews.offsetHeight;
                inFocus.style.bottom = `${height}px`;
                document.getElementById('article_shorts_icon_widget').style.bottom=(140+height)+'px';
              } else{
                document.getElementById('article_shorts_icon_widget').style.bottom=(12+inFocus.offsetHeight)+'px';
              }

              if(document.getElementById('breaking-news-notification')){
                document.querySelector('footer').style.marginBottom = '100px';
              }
          }else if(widgetType === 'latestpodcast'){
            this.attachLatestPodcastEvents(container);
            triggerGAEvent('latest_podcast_view','aiengagement','AI Latest Podcast View',url);
          }else if(widgetType === 'articlepodcast'){
            this.attachArticlePodcastEvents(container);
            triggerGAEvent('article_podcast_view','aiengagement','AI Article Podcast View',url);
          }
        })
        .catch(error => {
          console.error(`Error loading ${widgetType} widget:`, error);
          container.innerHTML = ''; // Leave empty if it fails
        });
    },

    // Attach events for latest podcast widget
    attachLatestPodcastEvents: function(container) {
      console.log('Attaching latest podcast events');
      
      // Execute the podcast JavaScript events directly
      (function() {
        function e(e,t,n,a){
          const i=document.getElementById(e),d=document.getElementById(t),c=document.getElementById(n),o=document.getElementById(a);
          if(!(i&&d&&c&&o))return;
          function l(){d.style.display="none",i.style.display="inline-block"}
          function s(){i.style.display="none",d.style.display="inline-block"}
          l();
          let r=null,u=1,p=!0;
          function y(){u+=p?.01:-.01,u>=1.3&&(p=!1),u<=1&&(p=!0),o.style.transform="scale("+u+")";const e=Math.max(.6,Math.min(1,u-.2));o.style.opacity=String(e),r=requestAnimationFrame(y)}
          function m(){r||(r=requestAnimationFrame(y))}
          function E(){r&&cancelAnimationFrame(r),r=null,u=1,p=!0,o.style.transform="scale(1)",o.style.opacity="1"}
          function f(){s(),m()}
          c.muted=!1;
          i.addEventListener("click",(e=>{e.preventDefault(),c.play().then(f).catch((()=>(c.load(),new Promise((e=>{const t=()=>{c.removeEventListener("canplay",t),c.play().then((()=>{f(),e(!0)})).catch((()=>{e(!1)}))};c.addEventListener("canplay",t,{once:!0})})))))})),d.addEventListener("click",(e=>{e.preventDefault(),c.pause(),l(),E()})),c.addEventListener("play",(()=>{s(),m()})),c.addEventListener("pause",(()=>{l(),E()})),c.addEventListener("ended",(()=>{l(),E()})),c.addEventListener("error",(()=>{l(),E()}))
        }
        e("rd_ai_podcast_play","rd_ai_podcast_pause","podcast_audio","podcircle_2");
        e("rd_ai_podcast_play2","rd_ai_podcast_pause2","podcast_audio2","podcircle_22");
      })();
    },

    // Attach events for article podcast widget
    attachArticlePodcastEvents: function(container) {
      console.log('Attaching article podcast events');
      
      // The article podcast widget has its own JavaScript in the HTML
      // No additional event handling needed as it's self-contained
    }
  };

  function showQuizWidget(){
     helpers.loadWidget('quiz', config.quizContainerId);
  }
  
  // Main initialization - load widgets in parallel without redundant network calls
  function init() {

    const isMobile = window.innerWidth <= 768;

    // if(!isMobile){
    //   console.log("Widgets supported in mobile only");
    //   return;
    // }

    console.log('Initializing AI Widgets...');
    
    // Load all widgets in parallel
    const containers = {
      quiz: document.getElementById(config.quizContainerId),
      summary: document.getElementById(config.summaryContainerId),
      keytakeaways: document.getElementById(config.keyTakeawaysContainerId),
      poll: document.getElementById(config.pollContainerId),
      scrollableShorts: document.getElementById(config.scrollableShortsId),
      homeShortsWidget: document.getElementById(config.homeShortsWidgetContainerId),
      latestpodcast: document.getElementById(config.latestPodcastContainerId),
      articlepodcast: document.getElementById(config.articlePodcastContainerId),
      podcast: document.getElementById('rd_ai_podcast')
    };
    
    // Only make API calls for containers that exist in the DOM
    if (containers.quiz) {
      helpers.loadWidget('quiz', config.quizContainerId);
    }
    
    if (containers.summary) {
      helpers.loadWidget('summary', config.summaryContainerId);
    }
    
    if (containers.scrollableShorts) {
      helpers.loadWidget('shorts', config.scrollableShortsId);
    }

    if (containers.poll) {
      helpers.loadWidget('poll', config.pollContainerId);
    }

    if(containers.homeShortsWidget){
      helpers.loadHomeShortsWidget(config.homeShortsWidgetContainerId);
    }

    if (containers.keytakeaways) {
      helpers.loadWidget('keytakeaways', config.keyTakeawaysContainerId);
    }

    if(containers.latestpodcast){
      helpers.loadWidget('latestpodcast', config.latestPodcastContainerId);
    }else{
      if(containers.podcast){
          helpers.loadWidget('latestpodcast', 'rd_ai_podcast');
      }
    }

    if(containers.articlepodcast){
      helpers.loadWidget('articlepodcast', config.articlePodcastContainerId);
    }
    
    // Add window resize event listener to handle mobile/desktop transitions
    window.addEventListener('resize', function() {
      if (containers.scrollableShorts) {
        helpers.loadWidget('shorts', config.scrollableShortsId);
      }
    });
  }

  function triggerGAEvent(action, category, label = '', value = '') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: action,
      event_category: category,
      event_label: label,
      value: value
    });

    if (typeof gtag === "function") {
      gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value
      });
    } else {
      console.warn("gtag is not defined on this page.");
    }

  }
  
  // Run initialization when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const onElementReady = (sel, cb, t=5000) => {
    const el = document.querySelector(sel);
    if (el) return cb(el);
    const obs = new MutationObserver((m,o)=>{const e=document.querySelector(sel);if(e){cb(e);o.disconnect();}});
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(), t);
  };

  if(window.location.hostname=='timeskerala.com'){
    onElementReady('#rd_ai_summary', init);
    onElementReady('#rd_ai_podcast', init);
    onElementReady('#rd_ai_quiz', showQuizWidget);
  }


  if(window.location.hostname=='newskarnataka.com'){
     function onUrlChange(url) {
        console.log('URL changed to:', url);
      }

      // Keep original methods
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      function handleUrlChange(method, ...args) {
        const result = method.apply(this, args);
        const url = args[2]; // the new URL
        onUrlChange(url);
        return result;
      }

      history.pushState = function(...args) {
        return handleUrlChange.call(this, originalPushState, ...args);
      };

      history.replaceState = function(...args) {
        return handleUrlChange.call(this, originalReplaceState, ...args);
      };

      // Also catch back/forward navigation
      window.addEventListener('popstate', function() {
        onUrlChange(window.location.href);
      });

      // Run on initial load
      onUrlChange(window.location.href);
  }
  

})();
