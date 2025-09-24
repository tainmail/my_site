import{createApp, reactive, ref, computed, onMounted } from "https://unpkg.com/vue@3.4.21/dist/vue.esm-browser.js";

//預設資料
const preSetJson = {
	partyA: {
		name: "吳先生",
		phone: "0912-345678",
		address: "高雄市三民區秋元街 66 巷 1 號",
		taxId: "987654321",
		email: "wu@example.com",
		signatureDate: "2025-08-01",
	},
	partyB: {
		name: "統冠工程行",
		representative: "劉東原",
		phone: "0970-762-271",
		address: "嘉義縣朴子市新庄里1鄰新庄1號之5一樓",
		taxId: "88954678",
		email: "yi.shouy88@gmail.com",
		website: "https://tongguan88.com.tw/",
		logo:"https://tongguan88.com.tw/images/logo_tongguan.png",
		note:"開發票加5%，保固一年現場估價。"
	},
	jobList: [
		{
			id: 1,
			name: "前外牆防水工程",
			spec: "坪",
			quantity: 21.8,
			unitPrice: 1200,
			note: "含側牆",
			taskList: ["矽利康修補裂縫及孔洞", "矽樹脂防水材+甲苯(1:1)面塗"],
		},
		{
			id: 2,
			name: "女兒牆防水工程",
			spec: "坪",
			quantity: 15.4,
			unitPrice: 1200,
			note: "",
			taskList: ["矽樹脂防水材+甲苯(1:3)底塗", "矽利康修補裂縫及孔洞"],
		},
	],
};

//記錄 localStorage
const myStorage = reactive({
	key: "tongguan_08",
	fnRead() {
		console.log("讀取Storage", this.key);
		return JSON.parse(localStorage.getItem(this.key)) || preSetJson;
	},
	fnSave(argList) {
		console.log("寫入Storage", this.key);
		localStorage.setItem(this.key, JSON.stringify(argList));
	},
});

//主應用
createApp({
	setup() {
		//合約資料
		const contractData = reactive(myStorage.fnRead());
		
		//小計
		const subtotal = computed(() =>
			contractData.jobList.reduce( (sum, item) => sum + item.quantity * item.unitPrice, 0 )
		);

		//編輯當前 工作明細
		const currentEditJob = ref(null);

		//工作任務
		const blankTask = ref("");

		// 顯示 modal lightBox 模組
		const bShowProjectModal = ref(false);
		const bShowJobModal = ref(false);    // 是否顯示編輯 job 的 modal

		//新增 工作明細
		const fnAddJob = ()=>{
			const tmpJob = {
				id: Date.now(),
				name: "",
				spec: "",
				quantity: 1,
				unitPrice: 0,
				note: "",
				taskList: [],
			};
			contractData.jobList.push(tmpJob);
			currentEditJob.value = tmpJob;
			bShowJobModal.value = true;
		}

		//編輯 工作明細
		const fnEditJob = (argItem)=>{
			currentEditJob.value = argItem;
			bShowJobModal.value = true;
		}

		//刪除 工作明細
		const fnDelJob = (idx)=>{
			contractData.jobList.splice(idx, 1);
			myStorage.fnSave(contractData);
		}

		//新增 工作任務
		const fnAddTask = ()=>{
			if (blankTask.value.trim()) {
				currentEditJob.value.taskList.push(blankTask.value.trim());
				blankTask.value = "";
				myStorage.fnSave(contractData);
			}
		}

		
		//開啟舊檔
		const fnJsonOpen = ()=>{
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".json";
			input.onchange = (e) => {
				const file = e.target.files[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = (event) => {
						try {
							const jsonData = JSON.parse(event.target.result);
							Object.assign(contractData, jsonData);
							myStorage.fnSave(contractData);
							alert("JSON 載入成功！");
						} catch (err) {
							alert("JSON 檔案格式錯誤！");
						}
					};
					reader.readAsText(file);
				}
			};
			input.click();
		}

		//另存新檔
		const fnJsonSave = ()=>{
			const timestamp = new Date()
				.toISOString()
				.replace(/[-:T]/g, "")
				.slice(0, 14);
			const filename = `${contractData.partyA.name}_${contractData.partyA.address}_${timestamp}.json`;
			const jsonStr = JSON.stringify(contractData, null, 2);
			const blob = new Blob([jsonStr], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		// onMounted
		onMounted(async () => {
			// 設定 HTML 網頁標題
			if (contractData.partyB && contractData.partyB.name) {
				document.title = `${contractData.partyB.name} 估價單`;
			}
		});

		return {
			contractData,
			subtotal,
			currentEditJob,
			blankTask,
			bShowProjectModal,
			bShowJobModal,
			fnEditJob,
			fnDelJob,
			fnAddTask,
			fnAddJob,
			fnJsonOpen,
			fnJsonSave,
		};
	},
}).mount("#app");
