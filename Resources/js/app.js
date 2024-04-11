// Begin fetch data
let ghosts = [];

await fetch("/Resources/data/ghosts.json")
	.then((response) => response.json())
	.then((data) => {
		ghosts = data;
	})
  	.catch((error) => console.error("Error loading JSON file", error));

let filters = [];

await fetch("/Resources/data/filters.json")
	.then((response) => response.json())
	.then((data) => {
		filters = data;
	})
	.catch((error) => console.error("Error loading JSON file", error));

// End fetch data

let ghostfilters = document.querySelectorAll('.js-ghostfilter');
ghostfilters.forEach(ghostfilter => {
	let filterCategories = [];
	let filterSection = ghostfilter.querySelector('.js-filter-section');
	
	filters.forEach(filterCategory => {
		filterCategories.push(filterCategory);
	});

	filterCategories.forEach(filterCategory => {
		let categoryAssignedFilters = filterCategory.categoryAssignedFilters;

		filterSection.innerHTML += '';
		filterSection.innerHTML += `
		<div class="filter-category" data-category-id="${filterCategory.categoryId}">
			<div class="category-name mb-4">
				<h4 data-i18n="filters.cat.${filterCategory.categoryId}.name"></h4>
				<p class="text-muted" data-i18n="filters.cat.${filterCategory.categoryId}.description"></p>
			</div>
			<div class="filter-container row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4 gy-3"></div>
		</div>`;
		
		let thisCategoryRowMarkup = filterSection.querySelector('[data-category-id="' + filterCategory.categoryId + '"] .filter-container');
		
		categoryAssignedFilters.forEach(assignedFilter => {
			thisCategoryRowMarkup.innerHTML += `<div class="col assigned-filter unset" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="filter-tooltip" data-tooltip-i18n="filters.${filterCategory.categoryId}.${assignedFilter.id}.description" data-bs-title="">
				<div class="row flex-nowrap gx-2 gy-0">
					<div class="col-auto">
						<div class="filteritem js-filteritem" data-filtervalue="${assignedFilter.id}" data-value="unset"></div>
					</div>
					<div class="col">
						<span data-i18n='filters.${filterCategory.categoryId}.${assignedFilter.id}'></span>
					</div>
				</div>
			</div>`
		});
	});

	// Create Results markup
	let filterResults = ghostfilter.querySelector('.js-filter-results');
	filterResults.innerHTML = "";
	filterResults.innerHTML = "<div class='row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4 gy-3'></div>";

	let filterResultsRow = filterResults.querySelector('.row');

	ghosts.forEach(ghost => {
		let ghostAssignedFilters = ghost["filters"];
		let includeGhostAssignedFilters = [];
		let includeGhostAssignedFiltersString = '';
		let excludeGhostAssignedFilters = [];
		let excludeGhostAssignedFiltersString = '';

		Object.keys(ghostAssignedFilters).forEach(function(item) {
			if(ghostAssignedFilters[item] == true ) {
				includeGhostAssignedFilters.push(item);
			} else {
				excludeGhostAssignedFilters.push(item);
			}
		});
		includeGhostAssignedFiltersString = includeGhostAssignedFilters.join();
		excludeGhostAssignedFiltersString = excludeGhostAssignedFilters.join();
		
		filterResultsRow.innerHTML += `<div class="col resultitem js-resultitems" data-resultitem-name="${ghost.id}" data-ignore-not-evidence-exclude="${ghost.ignoreNotEvidenceExclude}" data-filter-include="${includeGhostAssignedFiltersString}" data-filter-exclude="${excludeGhostAssignedFiltersString}"> 
			<div class="card">
				<div class="row g-0">
					<div class="col-auto">
						<img src="/Resources/images/ghosts/${ghost.id}.webp" class="img-fluid rounded-start" alt="${ghost.name}">
					</div>
					<div class="col">
						<div class="card-body">
							<h5 class="card-title" data-i18n="ghosts.${ghost.id}.name"></h5>
							<div class="card-text">
								<div class="row">
									<div class="col-auto">
										<div class="dropdown-center">
											<a class="ghost-dropdown-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"><i class="fa-solid fa-circle-info"></i></a>
											<div class="dropdown-menu p-4">
												<div class="mb-4" data-i18n="ghosts.${ghost.id}.description"></div>
												<span data-i18n="ghosts.${ghost.id}.description.wikilink"></span>
												<div class="mt-4" data-i18n="ghosts.${ghost.id}.description.badges"></div>
												<div class="accordion mt-4 has-tip-${ghost.hasTip}" id="accordion-${ghost.id}">
													<div class="accordion-item">
														<span class="accordion-header fw-bold" id="heading-${ghost.id}">
															<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#tipp-${ghost.id}" aria-expanded="false" aria-controls="tipp-${ghost.id}">
															Tipp
															</button>
														</span>
														<div id="tipp-${ghost.id}" class="accordion-collapse collapse" aria-labelledby="heading-${ghost.id}" data-bs-parent="#accordion-${ghost.id}">
															<div class="accordion-body" data-i18n="ghosts.${ghost.id}.description.tipp"></div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="col"></div>
									<div class="col-auto">
										<a class="manually-exclude-btn js-manually-exclude-btn"><i class="fa-solid fa-trash"></i><i class="fa-solid fa-rotate-right d-none"></i></a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>`;
	});

	// Filter logic
	let activeIncludeFilters = [];
	let activeExcludeFilters = [];
	let manuallyExcludedGhosts = [];

	let filterCheckboxes = ghostfilter.querySelectorAll('.js-filteritem');
	filterCheckboxes.forEach(filterCheckbox => {
		let thisCheckboxFiltername = filterCheckbox.getAttribute('data-filtervalue');
		let thisCheckboxContainer = filterCheckbox.parentNode.parentNode;
		let thisAssignedFilterContainer = thisCheckboxContainer.parentNode;

		thisCheckboxContainer.addEventListener('click', function() {
			let thisClickedFilter = this.querySelector('.js-filteritem');

			switch(filterCheckbox.getAttribute('data-value')) {
			    case 'on':
					if(thisAssignedFilterContainer.classList.contains('on')) {
						thisAssignedFilterContainer.classList.remove('on');
					}

					if(!thisAssignedFilterContainer.classList.contains('off')) {
						thisAssignedFilterContainer.classList.add('off');
					}

			        filterCheckbox.setAttribute('data-value', 'off');
					filterCheckbox.innerHTML = 
					"<i class='fa-solid fa-xmark'></i>";

					const indexIncludeFilters = activeIncludeFilters.indexOf(thisCheckboxFiltername);
					activeIncludeFilters.splice(indexIncludeFilters, 1);

					activeExcludeFilters.push(thisCheckboxFiltername);

			        break;
			    case 'off':
					if(thisAssignedFilterContainer.classList.contains('off')) {
						thisAssignedFilterContainer.classList.remove('off');
					}

					if(!thisAssignedFilterContainer.classList.contains('unset')) {
						thisAssignedFilterContainer.classList.add('unset');
					}

			        filterCheckbox.setAttribute('data-value', 'unset');
					filterCheckbox.innerHTML = "";

					const indexExcludeFilters = activeExcludeFilters.indexOf(thisCheckboxFiltername);
					activeExcludeFilters.splice(indexExcludeFilters, 1);
			        break;
			    case 'unset':
					if(thisAssignedFilterContainer.classList.contains('unset')) {
						thisAssignedFilterContainer.classList.remove('unset');
					}

					if(!thisAssignedFilterContainer.classList.contains('on')) {
						thisAssignedFilterContainer.classList.add('on');
					}

			        filterCheckbox.setAttribute('data-value', 'on');
					filterCheckbox.innerHTML = 
					"<i class='fa-solid fa-check'></i>";
					
					activeIncludeFilters.push(thisCheckboxFiltername);

			        break;
			    default:
			         // display the current value if it's unexpected
			        alert(filterCheckbox.getAttribute('data-value'));
			}

			let checkIfArrayIncludesEveryTargetArrayItem = (arr, target) => target.every(v => arr.includes(v));
			const findOne = (haystack, arr) => {
				return arr.some(v => haystack.includes(v));
			};

			let allFilterItems = ghostfilter.querySelectorAll('.js-resultitems');
			allFilterItems.forEach(filterItem => {
				// Include Filters

				let thisFilterItemIncludeFiltersString = filterItem.getAttribute('data-filter-include');
				let thisFilterItemIncludeFiltersArray = thisFilterItemIncludeFiltersString.split(',');

				if(!checkIfArrayIncludesEveryTargetArrayItem(thisFilterItemIncludeFiltersArray,activeIncludeFilters)) {
					if(!filterItem.classList.contains('auto-excluded')) {
						filterItem.classList.add('auto-excluded');
					}
				} else {
					if(filterItem.classList.contains('auto-excluded')) {
						filterItem.classList.remove('auto-excluded');
					}
					if(!filterItem.classList.contains('included')) {
						filterItem.classList.add('included');
					}
				}

				if(activeIncludeFilters.length < 1) {
					if(filterItem.classList.contains('included')) {
						filterItem.classList.remove('included');
					}
				}

				// Exclude Filters

				if(findOne(thisFilterItemIncludeFiltersArray,activeExcludeFilters)) {
					if(!filterItem.classList.contains('excluded')) {
						filterItem.classList.add('excluded');
					}
				} else {
					if(filterItem.classList.contains('excluded')) {
						filterItem.classList.remove('excluded');
					}
				}
			});

			
			let allignoreNotEvidenceExcludeFilterItems = ghostfilter.querySelectorAll('.js-resultitems[data-ignore-not-evidence-exclude="true"]');
			allignoreNotEvidenceExcludeFilterItems.forEach(ignoreNotEvidenceExcludeFilterItem => {
				let allEvidenceFilters = filterCategories[0].categoryAssignedFilters;
				let allEvidenceFiltersNames = [];

				allEvidenceFilters.forEach(evidenceFilter => {
					allEvidenceFiltersNames.push(evidenceFilter.id);
				});
					
				if (thisClickedFilter.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-category-id') != "evidence") {
					if(!findOne(activeExcludeFilters, allEvidenceFiltersNames)) {
						if(ignoreNotEvidenceExcludeFilterItem.classList.contains('excluded')) {
							ignoreNotEvidenceExcludeFilterItem.classList.remove('excluded');
						}
					}
				} else {
					if(findOne(allEvidenceFiltersNames,activeExcludeFilters)) {
						if(!ignoreNotEvidenceExcludeFilterItem.classList.contains('force-excluded')) {
							ignoreNotEvidenceExcludeFilterItem.classList.add('force-excluded');
						}
					} else {
						if(ignoreNotEvidenceExcludeFilterItem.classList.contains('force-excluded')) {
							ignoreNotEvidenceExcludeFilterItem.classList.remove('force-excluded');
						}
					}
				}
			})
			
			// Reset Button

			let resetButtonContainer = ghostfilter.querySelector('.js-reset-button-container');
			if(activeIncludeFilters.length || activeExcludeFilters.length) {
				resetButtonContainer.innerHTML = "<div class='reset-button js-reset-button btn rounded'><i class='fa-solid fa-rotate-right me-2'></i>Reset Filter</div>";
				let resetButton = ghostfilter.querySelector('.js-reset-button');

				resetButton.addEventListener('click', function() {
					activeIncludeFilters = [];
					activeExcludeFilters = [];

					filterCheckboxes.forEach(filterCheckbox => {
						let thisCheckboxContainer = filterCheckbox.parentNode.parentNode;
						let thisAssignedFilterContainer = thisCheckboxContainer.parentNode;
	
						if(thisAssignedFilterContainer.classList.contains('off')) {
							thisAssignedFilterContainer.classList.remove('off');
						}
	
						if(!thisAssignedFilterContainer.classList.contains('unset')) {
							thisAssignedFilterContainer.classList.add('unset');
						}
	
						filterCheckbox.setAttribute('data-value', 'unset');
						filterCheckbox.innerHTML = "";
	
					})

					let allFilterItems = ghostfilter.querySelectorAll('.js-resultitems');
					allFilterItems.forEach(filterItem => {
						filterItem.classList.remove('included', 'excluded', 'auto-excluded', 'force-excluded', 'manually-excluded');
					});

					resetButtonContainer.innerHTML = "";
				});
			} else {
				resetButtonContainer.innerHTML = "";
			}
		});
	});

	// manually exclude results (only visually)
	
	let allResultItems = ghostfilter.querySelectorAll('.js-resultitems');
	allResultItems.forEach(resultitem => {
		let resultitemName = resultitem.getAttribute('data-resultitem-name');
		let manuallyExcludeButton = resultitem.querySelector('.js-manually-exclude-btn');

		manuallyExcludeButton.addEventListener('click', function() {
			if(resultitem.classList.contains('manually-excluded')) {
				resultitem.classList.remove('manually-excluded');

				const indexManuallyExcludedGhosts = manuallyExcludedGhosts.indexOf(resultitemName);
				manuallyExcludedGhosts.splice(indexManuallyExcludedGhosts, 1);

			} else {
				resultitem.classList.add('manually-excluded');

				manuallyExcludedGhosts.push(resultitemName);
			}

			let manuallyExcludeButtonIcons = manuallyExcludeButton.querySelectorAll('i');
			manuallyExcludeButtonIcons.forEach(icon => {
				if(icon.classList.contains('d-none')) {
					icon.classList.remove('d-none');
				} else {
					icon.classList.add('d-none');
				}
			});
		});
	});
});

setTimeout(() => {
	// initialize tooltips
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}, 700);
