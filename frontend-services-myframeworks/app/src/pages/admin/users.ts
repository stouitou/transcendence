import { BaseComponent } from "../../frameworks/base-component";
import { UserContext } from "../../globalstate/GlobalState";
import { User} from "../../types/types";
import { deleteUser, disable2FA, editUser, get2FAStatus, getUsers , MetaPaginationUsers, uploadAvatar } from "../../services/api.admin";
import { AdminUsersFormData } from "../../types/forms.type";
import { adminedeletuserconstraint, admineditAvatarconstraint, admineditnameconstraint, admineditroleconstraint, adminedittoggle2faconstraint } from "../../utils/constraints";


export class AdminUsers extends BaseComponent<{ user: User | null,
	users: User[] | null,
	metaPagination:{users: MetaPaginationUsers| null} }> {
  constructor() {
	super({ user: null,users: null,metaPagination:{users: null} });
  }

  connectedCallback() {
	this.state.user = UserContext().user();
	getUsers({limit:10},{type:"remote"}).then((result) => { 
		if (!result || !result.success) return;
		const {data:users,meta} = result;
		console.log('getusers(remote).then((data) users', users);
	  if (users) {
		this.state.metaPagination.users= meta;
		this.state.users = users
		this.render();
		}
	}).catch((e) =>console.error(e));
	this.render();
  }



  setUser(user: User) {
	this.setState({ ...this.state, user });
  }

  determinePageCount(offset:number,pagination: MetaPaginationUsers):{ currentPage: number, pageCount: number } {
	const { limit, total } = pagination;
	const pageCount = Math.ceil(total / limit);
	const currentPage = Math.floor(offset / limit) + 1;
	return { currentPage, pageCount };
	
  }
  generatePagination(currentPage: number, pageCount: number,type:string): string {
	let paginationHTML = '';
  
	// Bouton "Précédent"
	paginationHTML += `
	  <li  data-page="${currentPage - 1}" data-type="${type}" class="paginator">
		<div class="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
		   data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
		  <span class="sr-only">Previous</span>
		  <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
		  </svg>
		</div>
	  </li>
	`;
  
	// Boutons pour chaque page
	for (let i = 1; i <= pageCount; i++) {
	  paginationHTML += `
		<li  data-page="${i}"  data-type="${type}" class="paginator">
		  <div class="flex items-center justify-center px-4 h-10 leading-tight ${
			i === currentPage
			  ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
			  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
		  }" data-page="${i}">
			${i}
		  </div>
		</li>
	  `;
	}
  
	// Bouton "Suivant"
	paginationHTML += `
	  <li  data-page="${currentPage + 1}"  data-type="${type}" class="paginator">
		<div class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
		   data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}>
		  <span class="sr-only">Next</span>
		  <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
		  </svg>
		</div>
	  </li>
	`;
  
	return paginationHTML;
  }
  render() {
	const { user , users, metaPagination} = this.state;

	if (users) {
		const usersPagination = metaPagination.users
		? this.generatePagination(
			this.determinePageCount(metaPagination.users.offset, metaPagination.users).currentPage,
			this.determinePageCount(0, metaPagination.users).pageCount,
			"local"
		  )
		: '';
  

	  this.innerHTML = `
		
		<div class="mx-auto p-6 text-center">
			  <h2 class="text-3xl font-bold text-center mb-6 ">Users ${this.state.metaPagination.users?.total||0}</h2>
			<button class="btn">create new User</button>	
			  <nav aria-label="Page navigation ">
					<ul class="flex items-center -space-x-px h-10 text-base">
						${ usersPagination}
					</ul>
				</nav>
			
			<table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
		<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
			<tr>
				<th scope="col" class="p-4">
					<div class="flex items-center">
						<input id="checkbox-all-search" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
						<label htmlFor="checkbox-all-search" class="sr-only">checkbox</label>
					</div>
				</th>
				<th scope="col" class="px-6 py-3">
					Id
				</th>
				<th scope="col" class="px-6 py-3">
					name
				</th>
				<th scope="col" class="px-6 py-3">
					date
				</th>
				<th scope="col" class="px-6 py-3">
					action
				</th>
			</tr>
		</thead>
		<tbody id="table-game-history-local"></tbody>
	</table>
		</div>


		`;
		const tbodyLocal = document.querySelector('#table-game-history-local')
		if (tbodyLocal) {
		  users?.forEach((user) =>
			tbodyLocal.innerHTML +=this.usersDetailsView(user)
		  
		  );
		}

		  // Ajouter l'événement de click pour rediriger vers le détail du tournoi
		  this.querySelectorAll('.userRow').forEach(card => {
			//this.shadowRoot.querySelectorAll('.tournamentRow').forEach(card => {
			card.addEventListener('click', (e: Event) => {
			  const target = e.currentTarget as HTMLElement;
			   const id = target.getAttribute('data-id');
			  if (!id) return;		 
			 const game = this.state.users?.find(u => u.id === Number(id))|| this.state.users?.find(u => u.id === Number(id));
			 if (!game) return;
			 // Créer un nouvel élément <tr>
			 const newRow = document.createElement('tr');
			 const newRowTd = document.createElement('td');
			 newRowTd.setAttribute('data-type', 'detail');
			 newRowTd.setAttribute('colspan', '5');

			 const newRowTdContent = document.createElement('admin-users-view') as any;;
			 newRowTdContent.data = game
			 newRowTd.appendChild(newRowTdContent);
			 newRow.appendChild(newRowTd);
			 
			 if (target.parentNode) {
			 // Vérifier si le nouvel élément existe déjà
			const existingRow = target.nextSibling;
			if (existingRow && (existingRow.nodeType === Node.ELEMENT_NODE)) {
			   // Si oui, le supprimer
			   target.parentNode.removeChild(existingRow);
			 }else {
			   // Sinon, ajouter le nouvel élément
			   target.parentNode.insertBefore(newRow, target.nextSibling);
			 }	 
			}});
		  });

		  this.querySelectorAll('.paginator').forEach((button) => {
			button.addEventListener('click', (e: Event) => {
			  e.preventDefault();
			  console.log('paginator click');
			  const target = e.currentTarget as HTMLElement;
			  const page = Number(target.getAttribute('data-page'));
			  const type = target.getAttribute('data-type');
			  console.log('page', page);
			  if (!page || page < 1) return;
			  if (!type) return;		  
			  // Charger les données pour la page sélectionnée
			  getUsers({ limit: 10, offset: (page - 1) * 10 }, { type: type }).then((result) => {
				if (!result) return;
				const { data:users, meta } = result;				
				  this.state.metaPagination.users = meta;
				  this.state.users = users;
				  this.render();
			  });
			});
		  });
	  return;
	}
	this.innerHTML = `not user //@TODO: add loading spinner or redirect`;
  }

  usersDetailsView = (user:User) => {
	console.log('userDetailsView', user);
	return (`
	<tr data-id="${user.id}" class="userRow border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
	
		<td class="w-4 p-4">
			<div class="flex items-center">
				<input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
				<label htmlFor="checkbox-table-search-1" class="sr-only">checkbox</label>
			</div>
		</td>
		<td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
			<div class="ps-3">
				<div class="text-base font-semibold">${user.id}</div>
			</div>  
		</td>
		<td class="px-6 py-4">
			${user.name}
		</td>
		<td class="px-6 py-4">
			 ${new Date(user.created_at).toLocaleDateString()}
			
		</td>
		<td class="px-6 py-4">
			<div class="flex items-center flex-row gap-2">
				<button class="edit btn" data-id="${user.id}">edit</button><button class="delete btn" data-id="${user.id}">delete</button>
			</div>
		</td>
	</tr>
	`);
  }
}


//<admin-users></admin-users>

export class AdminUsersComponent extends BaseComponent <{two_factor_auth:boolean},AdminUsersFormData> {
  private user: User | null = null;

  constructor() {
	super({two_factor_auth:false});
  }

  set data(user: User) {
    this.user = user;
  //  this.render();
  }

/*   fetchTwoFAStatus = async (userId: number) => {
	const response = await fetch(`/api/users/${userId}/2fa/status`);
	if (!response.ok) {
	  throw new Error('Failed to fetch 2FA status');
	}
	const data = await response.json();
	this.state.two_factor_auth = data.two_factor_auth;
	} */
  
    connectedCallback() {
		if (!this.user) {
			this.innerHTML = `<div>No user selected</div>`;
			return;
		}
		get2FAStatus(this.user?.id).then((result) => {
			if (!result) return;
			console.log('get2FAStatus', result);
			this.state.two_factor_auth = result.two_factor_auth;
	  		this.render();
		}).catch((e) =>console.error(e));
	
	  this.render();//@TODO: spinner for prerendering
	  // attach a custom error handler for the form
	  this.setApiErrorHandler(400, {
		message: 'Bad request. Please check your input.',
	   action: (error) => { this.showMessage(error.message, 'error'); }
	  });    
	}
	attachAllForm() {
		// attach the form handler to the form
		const formHandlerEditName = this.addForm('formEditName');
		const formHandlerEditAvatar = this.addForm('formEditAvatar');
		const formHandlerChangeRole = this.addForm('formEditRole');
		const formHandlerToggle2fa = this.addForm('formToggle2FA');
		const formHandlerDeleteUser = this.addForm('formDeleteUser');
		
		// add the validation constraints to the form handler
		formHandlerEditName?.addValidation(admineditnameconstraint);
		formHandlerEditAvatar?.addValidation(admineditAvatarconstraint);
		formHandlerChangeRole?.addValidation(admineditroleconstraint);
		formHandlerToggle2fa?.addValidation(adminedittoggle2faconstraint);
		formHandlerDeleteUser?.addValidation(adminedeletuserconstraint);

		// attach the event handler to the form
		this.attachEvent(this, '#formEditName', 'submit', this.handleSubmitName.bind(this));
		this.attachEvent(this, '#formEditAvatar', 'submit', this.handleSubmitAvatar.bind(this));
		this.attachEvent(this, '#formEditRole', 'submit', this.handleSubmitRole.bind(this));
		this.attachEvent(this, '#formToggle2FA', 'submit', this.handleSubmitToggle2FA.bind(this));
		this.attachEvent(this, '#formDeleteUser', 'submit', this.handleSubmitDelete.bind(this));
	}

  render() {
    if (!this.user) {
      this.innerHTML = `<div>No user selected</div>`;
      return;
    }
	const { two_factor_auth } = this.state;
    this.innerHTML = `
    <div class="admin-user-details flex flex-row gap-4 justify-center items-center">
      <div class="admin-user-details-info">
        <div id="message-box" class="font-bold text-center mb-4"></div>
        <h2>User: ${this.user.name}</h2>
        <img src="${this.user.avatar || '/default-avatar.png'}" alt="avatar" width="80" height="80" />
        <div>ID: ${this.user.id}</div>
        <div>Role: ${this.user.role}</div>
        <div>2FA: ${two_factor_auth ? 'Enabled' : 'Disabled'}</div>
        <div>Created At: ${new Date(this.user.created_at).toLocaleDateString()}</div>
        <div>Updated At: ${new Date(this.user.updated_at).toLocaleDateString()}</div>
      </div>
      <div class="admin-user-actions">

        <form id="formEditName">
          <input type="hidden" name="id" value="${this.user.id}" />
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Name:</label>
          <input 
            id="name"
            type="text"
            name="name" value="${this.user.name}" 
            class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div id="name-error" class="font-bold text-center mb-4"></div>
          <button type="submit" class="btn">Update Name</button>
        </form>
        <br><hr><br>

        <form id="formEditAvatar">
          <img id="avatar-preview"
            src=''
            alt="Avatar Preview, select a file to see the preview"
            class="max-w-[120px]"
            referrerPolicy="no-referrer"
          />
          <input type="hidden" name="id" value="${this.user.id}" />
          <label for="avatar" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New avatar:</label>
          <input					
            id="avatar"
            name="avatar"
            type="file"
            accept="image/png, image/jpeg"
            class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="${this.user.avatar || ''}"
           />
          <div id="avatar-error" class="font-bold text-center mb-4"></div>
          <button type="submit" class="btn">Update Avatar</button>
        </form>
        <br><hr><br>

        <form id="formEditRole">
          <input type="hidden" name="id" value="${this.user.id}" />
          <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New role:</label>
          <select name="role" class="select-form-message">
            <option value="user" ${this.user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="admin" ${this.user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
          <div id="role-error" class="font-bold text-center mb-4"></div>
          <button type="submit" class="btn">Update Role</button>
        </form>
        <br><hr><br>

        <form id="formToggle2FA">
          <input type="hidden" name="id" value="${this.user.id}" />
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Are you sure you want to ${two_factor_auth ? 'disable' : 'enable'} 2FA for this user?
          </label>

          <!-- switch -->
          <label class="relative inline-block w-[60px] h-[34px]">
            <input type="checkbox" name="confirm" required
              class="opacity-0 w-0 h-0 peer" />
            <span
              class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300
                transition-colors duration-400 peer-checked:bg-[#2196F3] rounded-full"></span>
            <span
              class="absolute left-[4px] bottom-[4px] w-[26px] h-[26px] bg-white
                transition-transform duration-400 peer-checked:translate-x-[26px] rounded-full"></span>
          </label>

          <button type="submit" class="btn">Update 2FA</button>
        </form>
        <br><hr><br>

        <form id="formDeleteUser">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Are you sure you want to delete this user?
          </label>
          <input type="hidden" name="id" value="${this.user.id}" />

          <!-- switch -->
          <label class="relative inline-block w-[60px] h-[34px]">
            <input type="checkbox" name="confirm" required
              class="opacity-0 w-0 h-0 peer" />
            <span
              class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300
                transition-colors duration-400 peer-checked:bg-[#2196F3] rounded-full"></span>
            <span
              class="absolute left-[4px] bottom-[4px] w-[26px] h-[26px] bg-white
                transition-transform duration-400 peer-checked:translate-x-[26px] rounded-full"></span>
          </label>

          <button type="submit" class="btn">Delete User</button>
        </form>
        <br><hr><br>

      </div>
    </div>
  `;
	this.attachAllForm();
    this.previewImage();
  }

	handleSubmitName = async(e: Event)=> {
		e.preventDefault()
		if (!this.user) throw new Error('user.id is null');
		const formHandler = this.getFormHandler('formEditName');
		if (!formHandler?.validateForm()) {
			this.showMessage('Please fix the errors in the form.', 'error');
			return;
		}
		try {
			const formData = formHandler.getFormData();
			await  editUser(this.user.id, {name:formData.name});
			this.showMessage(`Name updated! ${formData.name}`, 'success');
		} catch (error) {
				//console.error('register failed:', error);
			this.apiErrorHandler(error);
		}
	}
	handleSubmitRole = async(e: Event)=> {
		e.preventDefault()
		if (!this.user) throw new Error('user.id is null');
		const formHandler = this.getFormHandler('formEditRole');
		if (!formHandler?.validateForm()) {
			this.showMessage('Please fix the errors in the form.', 'error');
			return;
		}
		try {
			const formData = formHandler.getFormData();
			await  editUser(this.user.id, {role:formData.role});
			this.showMessage('Role updated!', 'success');
		} catch (error) {
				//console.error('register failed:', error);
			this.apiErrorHandler(error);
		}
	}
	handleSubmitToggle2FA = async(e: Event)=> {
		e.preventDefault()
		if (!this.user) throw new Error('user.id is null');
		const formHandler = this.getFormHandler('formToggle2FA');
		if (!formHandler?.validateForm()) {
			this.showMessage('Please fix the errors in the form.', 'error');
			return;
		}
		try {
			//const formData = formHandler.getFormData();
			await  disable2FA(this.user.id);
			this.showMessage('2FA updated!', 'success');
		} catch (error) {
				//console.error('register failed:', error);
			//this.apiErrorHandler(error);
		}
	}
	handleSubmitAvatar = async(e: Event)=> {
		e.preventDefault()
		if (!this.user) throw new Error('user.id is null');
		const formHandler = this.getFormHandler('formEditAvatar');
		if (!formHandler?.validateForm()) {
			this.showMessage('Please fix the errors in the form.', 'error');
			console.log('formHandler.getFormData()', formHandler?.getFormData());
			return;
		}
		try {
			const formData = formHandler.getFormData();
			console.log('formHandler.getFormData()', formData);
			 const newformData = new FormData();
   			 newformData.append('file', formData.avatar); 
			await  uploadAvatar(this.user.id, newformData);
			this.showMessage('avatar updated!', 'success');
		} catch (error) {
				//console.error('register failed:', error);
			this.apiErrorHandler(error);
		}
	}

	handleSubmitDelete = async(e: Event)=> {
		e.preventDefault()
		if (!this.user) throw new Error('user.id is null');
		const formHandler = this.getFormHandler('formDeleteUser');
		if (!formHandler?.validateForm()) {
			this.showMessage('Please fix the errors in the form.', 'error');
			console.log('formHandler.getFormData()', formHandler?.getFormData());
			return;
		}
		alert('delete user');
		try {
			const formData = formHandler.getFormData();
			await deleteUser(this.user.id);
			//await  registerUser(formData);
			this.showMessage('User Deleted!', 'success');
		} catch (error) {
				//console.error('register failed:', error);
			this.apiErrorHandler(error);
		}
	}



previewImage = () => {
  const input = this.querySelector('#formEditAvatar input[type="file"]') as HTMLInputElement;
  if (!input) return;

  let preview = this.querySelector('#avatar-preview') as HTMLImageElement;
  if (!preview) {
    preview = document.createElement('img');
    preview.id = 'avatar-preview';
    preview.style.maxWidth = '120px';
    preview.style.display = 'block';
    preview.referrerPolicy = 'no-referrer';
    input.parentNode?.insertBefore(preview, input.nextSibling);
  }

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    // ⚠️ Sécurité de base
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non supporté (jpeg, png uniquement).');
      input.value = '';
      return;
    }

    if (file.size < 1024) {
      alert('Fichier trop petit ou vide.');
      input.value = '';
      return;
    }

    // ✅ Teste la validité réelle via URL.createObjectURL
    const blobUrl = URL.createObjectURL(file);

    // Teste si l’image se charge bien
    const testImg = new Image();
    testImg.onload = () => {
      preview.src = blobUrl;
      preview.onload = () => URL.revokeObjectURL(blobUrl); // nettoyage
    };
    testImg.onerror = () => {
      alert('Impossible d\'afficher cette image. Fichier invalide ou corrompu.');
      input.value = '';
      preview.src = '';
      URL.revokeObjectURL(blobUrl);
    };
    testImg.src = blobUrl;
  });
};
}

customElements.define("admin-users-view", AdminUsersComponent);