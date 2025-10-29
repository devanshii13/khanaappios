import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { StorageService } from '../storage.service';

interface Category {
  id: number;
  en?: string;
  hi?: string;
  gu?: string;
  mr?: string;
  status?: number;
  subcategories?: SubCategory[];
}

interface SubCategory {
  id: number;
  en?: string;
  hi?: string;
  gu?: string;
  mr?: string;
  parent_id?: number;
}

interface Question {
  id: number;
  en?: string;
  hi?: string;
  gu?: string;
  mr?: string;
  // older APIs sometimes use 'question' field:
  question?: string;
  category_id?: number;
  subcategory_id?: number;
}

interface Answer {
  id?: number;
  en?: string;
  hi?: string;
  gu?: string;
  mr?: string;
  // older APIs sometimes use 'answer' field:
  answer?: string;
}

interface ChatTextMessage {
  type: 'text';
  from: 'bot' | 'user';
  text: string;
  time?: string;
}

interface ChatOptionsMessage {
  type: 'options';
  scope: 'category' | 'subcategory' | 'question';
  items: any[];
  disabled: boolean;
  id: number;
}

interface ChatActionsMessage {
  type: 'actions';
  id: number;
}

interface ChatFormMessage {
  type: 'form';
  id: number;
  submitted?: boolean;
}

interface ChatAnswerMessage {
  type: 'answer';
  from: 'bot';
  text: string;
  time?: string;
}

type ChatMessage = ChatTextMessage | ChatOptionsMessage | ChatActionsMessage | ChatFormMessage | ChatAnswerMessage;

@Component({
  selector: 'app-faq-chat',
  templateUrl: './faq-chat.component.html',
  styleUrls: ['./faq-chat.component.scss'],
})
export class FaqChatComponent implements OnInit {
  @ViewChild('history', { static: false }) historyRef: ElementRef;
  @ViewChild('categoryBlock', { static: false }) categoryBlockRef: ElementRef;
  @ViewChild('subcategoryBlock', { static: false }) subcategoryBlockRef: ElementRef;
  @ViewChild('questionsBlock', { static: false }) questionsBlockRef: ElementRef;
  @Output() dismiss = new EventEmitter<void>();

  categories: Category[] = [];
  currentCategory: Category = null;
  currentSubcategory: SubCategory = null;
  questions: Question[] = [];
  model:any={};
  messages: ChatMessage[] = [];
  outgoingText: string = '';
  loading = false;
  isTyping = false;
  private messageIdCounter = 0;

  // track if we've already shown prompts to avoid duplicates
  prompted = {
    category: false,
    subcategory: false,
    question: false,
  };

  // current language (default English)
  currentLang: string = 'en';

  supportForm = { name: '', email: '', mobile: '' };

  constructor(private storage:StorageService,private http: HttpClient) {}

  async ngOnInit() {

    var lang_code = JSON.parse(localStorage.getItem('lang'));
    this.currentLang = lang_code || 'en';
    let res = this.storage.getScope();
		let item1 = res.find(i => i.key_text === 'CHAT_WITH_US');
    this.model.chat_with_us = item1[lang_code];
    let item2 = res.find(i => i.key_text === 'HOW_CAN_I_ASSIST');
    this.model.how_can_i_assist = item2[lang_code];
    let item3 = res.find(i => i.key_text === 'PLS_CHOOSE_CATEGORY');
    this.model.pls_choose_category = item3[lang_code];
    let item4 = res.find(i => i.key_text === 'PLS_CHOOSE_SUBCATEGORY');
    this.model.pls_choose_subcategory = item4[lang_code];
    let item5 = res.find(i => i.key_text === 'PLS_CHOOSE_QUESTION');
    this.model.pls_choose_question = item5[lang_code];
    let item6 = res.find(i => i.key_text === 'CLEAR_CHAT_BTN');
    this.model.clear_chat_btn = item6[lang_code];
    let item7 = res.find(i => i.key_text === 'PREV_CATEGORY_BTN');
    this.model.prev_cat_btn = item7[lang_code];
    let item8 = res.find(i => i.key_text === 'NO_ANSWER_AWAILABLE');
    this.model.no_ans_available = item8[lang_code];
    let item9 = res.find(i => i.key_text === 'EXIT_CHAT_BTN');
    this.model.exit_chat_btn = item9[lang_code];
    let item10 = res.find(i => i.key_text === 'PREV_BTN');
    this.model.prev_btn = item10[lang_code];
    let item11 = res.find(i => i.key_text === 'QUES_LIST');
    this.model.ques_list = item11[lang_code];
    

    await this.botSay(this.model.how_can_i_assist);
    this.loadCategories();
  }

  private timestamp(): string {
    return formatDate(new Date(), 'hh:mm a', 'en-US');
  }

  private appendBotMessage(text: string) {
    this.messages.push({ type: 'text', from: 'bot', text, time: this.timestamp() });
    this.scrollToBottom();
  }

  private appendUserMessage(text: string) {
    this.messages.push({ type: 'text', from: 'user', text, time: this.timestamp() });
    this.scrollToBottom();
  }

  private pushOptions(scope: 'category'|'subcategory'|'question', items: any[]) {
    const id = ++this.messageIdCounter;
    this.messages.push({ type: 'options', scope, items, disabled: false, id });
    this.scrollToBottom();
  }

  private disableLastOptions(scope: 'category'|'subcategory'|'question') {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i];
      if (m.type === 'options' && m.scope === scope && !m.disabled) {
        m.disabled = true;
        break;
      }
    }
  }

  private pushActions() {
    const id = ++this.messageIdCounter;
    this.messages.push({ type: 'actions', id });
    this.scrollToBottom();
  }

  showSupportForm() {
    const id = ++this.messageIdCounter;
    this.messages.push({ type: 'form', id });
    this.scrollToBottom();
  }

  submitSupportForm() {
    const { name, email, mobile } = this.supportForm;
    if (!name || !email || !mobile) {
      this.appendBotMessage('Please fill all required fields.');
      return;
    }
    // Here you can POST the form data to your backend
    this.appendBotMessage('Thanks! Our team will reach out soon.');
    // Mark the latest form message as submitted
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i];
      if (m.type === 'form' && !m.submitted) {
        m.submitted = true;
        break;
      }
    }
    // optional: clear form
    this.supportForm = { name: '', email: '', mobile: '' };
  }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        const el = this.historyRef?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      } catch {}
    }, 60);
  }

  private scrollToLastOptions(scope: 'category'|'subcategory'|'question') {
    setTimeout(() => {
      try {
        const container: HTMLElement = this.historyRef?.nativeElement;
        if (!container) return;
        for (let i = this.messages.length - 1; i >= 0; i--) {
          const m = this.messages[i];
          if (m.type === 'options' && m.scope === scope) {
            const el = container.querySelector(`[data-index='${i}']`) as HTMLElement;
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
      } catch {}
    }, 60);
  }

  private delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

  private async botSay(text: string, delayMs: number = 700) {
    this.isTyping = true;
    this.scrollToBottom();
    await this.delay(delayMs);
    this.isTyping = false;
    this.appendBotMessage(text);
  }

  /* ---------- API calls ---------- */
  loadCategories() {
    this.loading = true;
    this.http.get<any>(environment.base_url + 'get-question-category')
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        async (res) => {
          this.categories = res?.data || [];
          if (this.categories.length) {
            await this.botSay(this.model.pls_choose_category);
            this.pushOptions('category', this.categories);
          } else {
            await this.botSay('No categories available at the moment.');
          }
        },
        async (err) => {
          console.error(err);
          await this.botSay('Sorry, I could not load categories right now.');
        }
      );
  }

  getQuesSubCategories(categoryId: number) {
    return this.http.get<any>(environment.base_url + 'get-question-sub-category?id=' + categoryId);
  }

  getQuestions(categoryOrSubId: number) {
    return this.http.get<any>(environment.base_url + 'get-question?category_id=' + categoryOrSubId);
  }

  getAnswer(questionId: number) {
    return this.http.get<any>(environment.base_url + 'get-answer?question_id=' + questionId);
  }

  /* ---------- UI actions with typing flow ---------- */
  async selectCategory(cat: Category) {
    // keep category options enabled so user can reselect
    this.appendUserMessage(this.getNameByLang(cat));
    this.currentCategory = cat;
    this.currentSubcategory = null;
    this.questions = [];

    this.isTyping = true;
    this.getQuesSubCategories(cat.id)
      .subscribe(
        async (res) => {
          const arr: SubCategory[] = res?.data || [];
          this.currentCategory.subcategories = arr;
          await this.delay(500);
          this.isTyping = false;

          if (arr.length > 0) {
            await this.botSay(this.model.pls_choose_subcategory);
            this.pushOptions('subcategory', arr);
          } else {
            this.loadQuestions(cat.id);
          }
        },
        async (err) => {
          console.error(err);
          this.isTyping = false;
          await this.botSay('Could not load subcategories.');
        }
      );
  }

  async selectSubcategory(sub: SubCategory) {
    // keep subcategory options enabled so user can reselect
    this.appendUserMessage(this.getNameByLang(sub));
    this.currentSubcategory = sub;

    this.isTyping = true;
    this.loadQuestions(sub.id);
  }

  loadQuestions(id: number) {
    this.getQuestions(id).subscribe(
      async (res) => {
        this.questions = res?.data || [];
        await this.delay(500);
        this.isTyping = false;
        if (this.questions.length > 0) {
          await this.botSay(this.model.pls_choose_question);
          this.pushOptions('question', this.questions);
        } else {
          await this.botSay('No questions found for this selection.');
        }
      },
      async (err) => {
        console.error(err);
        this.isTyping = false;
        await this.botSay('Failed to load questions.');
      }
    );
  }

  async selectQuestion(q: Question) {
    this.appendUserMessage(this.getNameByLang(q));
    this.isTyping = true;

    this.getAnswer(q.id).subscribe(
      async (res) => {
        let ansText = '';
        if (res?.data?.length) {
          const ansObj: Answer = res.data[0];
          ansText = this.getNameByLang(ansObj) || (ansObj.answer || '');
        } else if (res?.answer) {
          ansText = res.answer;
        } else if (res?.en || res?.hi || res?.answer) {
          ansText = this.getNameByLang(res) || res.answer || '';
        } else {
          ansText = this.model.no_ans_available;
        }

        await this.delay(600);
        this.isTyping = false;
        // Instead of botSay + pushActions, push a single answer message
        this.messages.push({ type: 'answer', from: 'bot', text: ansText, time: this.timestamp() });
        this.scrollToBottom();
      },
      async (err) => {
        console.error(err);
        this.isTyping = false;
        await this.botSay('Could not load the answer. Please try again later.');
      }
    );
  }

  /* Prev scrolling to previous options bubble */
  async prevFromQuestions() {
    // Try to scroll to last question options, else to main category
    const hasQuestionOptions = this.messages.some(m => m.type == 'options' && m.scope === 'question');
    console.log(hasQuestionOptions);
    if (hasQuestionOptions) {
      this.scrollToLastOptions('question');
    } else {
      this.scrollToLastOptions('subcategory');
    }
  }

  async goBack() {
    this.scrollToLastOptions('category');
  }

  async backToSubcategories() {
    this.scrollToLastOptions('subcategory');
  }

  async clearChat() {
    this.messages = [];
    this.currentCategory = null;
    this.currentSubcategory = null;
    this.questions = [];
    await this.botSay(this.model.how_can_i_assist);
    this.loadCategories();
  }

  async sendCustomMessage() {
    const text = (this.outgoingText || '').trim();
    if (!text) return;
    this.appendUserMessage(text);
    this.outgoingText = '';
    await this.botSay('Thanks — we received your message. Try choosing a category below.');
  }

  closeChat() {
    this.dismiss.emit();
  }

  /* ---------- Helper for multilingual ---------- */
  getNameByLang(item: any) {
    if (!item) return '';

    if (this.currentLang && item[this.currentLang] !== undefined && item[this.currentLang] !== null && item[this.currentLang] !== '') {
      return item[this.currentLang];
    }

    if (item.en) return item.en;

    const fallbackKeys = ['question', 'answer', 'title', 'name', 'text'];
    for (const k of fallbackKeys) {
      if (item[k]) return item[k];
    }

    if (typeof item === 'string') return item;
    return '';
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    localStorage.setItem('lang', JSON.stringify(lang)); 
    this.clearChat(); 
  }

  // Context-aware prev button logic
  prevNavigate(currentMsg: any, i: number) {
    if (currentMsg.type === 'answer') {
      // Go to previous question list
      for (let j = i - 1; j >= 0; j--) {
        const m = this.messages[j];
        if (m.type === 'options' && m.scope === 'question') {
          this.scrollToLastOptions('question');
          return;
        }
      }
      // If not found, fallback to subcategory or category
      for (let j = i - 1; j >= 0; j--) {
        const m = this.messages[j];
        if (m.type === 'options' && m.scope === 'subcategory') {
          this.scrollToLastOptions('subcategory');
          return;
        }
        if (m.type === 'options' && m.scope === 'category') {
          this.scrollToLastOptions('category');
          return;
        }
      }
    } else if (currentMsg.type === 'options' && currentMsg.scope === 'question') {
      // Go to previous subcategory or category
      for (let j = i - 1; j >= 0; j--) {
        const m = this.messages[j];
        if (m.type === 'options' && m.scope === 'subcategory') {
          this.scrollToLastOptions('subcategory');
          return;
        }
        if (m.type === 'options' && m.scope === 'category') {
          this.scrollToLastOptions('category');
          return;
        }
      }
    } else if (currentMsg.type === 'options' && currentMsg.scope === 'subcategory') {
      // Go to previous category
      for (let j = i - 1; j >= 0; j--) {
        const m = this.messages[j];
        if (m.type === 'options' && m.scope === 'category') {
          this.scrollToLastOptions('category');
          return;
        }
      }
    }
  }

  hasMultiplePrevQuestions(i: number): boolean {
    // Find the previous question options message
    for (let j = i - 1; j >= 0; j--) {
      const m = this.messages[j];
      if (m.type === 'options' && m.scope === 'question' && Array.isArray(m.items)) {
        return m.items.length > 1;
      }
    }
    return false;
  }
}
