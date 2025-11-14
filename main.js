
import * as dom from "./lib/Dom.js";

function* zip(a, b) {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    yield [a[i], b[i]];
  }
}

class QuizPlayer {
    
    constructor() {
        this.quiz_forms = [];
        this.current_quiz = 0;
        this.score = 0;
        this.container_element = dom.div().add_class("quiz-manager");
        this.score_element = dom.div().add_class("score-display").parent(this.container_element);
        dom.div().add_class("buttons-container").parent(this.container_element)
        .add_child(
            dom.div().add_classes(["control-button", "previous-button"]).text("Previous").parent(this.container_element)
            .add_event("click", () => this.show_previous_quiz())
        ).add_child(
            dom.div().add_classes(["control-button", "next-button"]).text("Next").parent(this.container_element)
            .add_event("click", () => this.show_next_quiz())
        ).add_child(
            dom.div().add_classes(["control-button", "reset-all-button"]).text("Reset All").parent(this.container_element)
            .add_event("click", () => this.reset())
        );

        let admin_container_element = dom.div().add_class("admin-container").parent(this.container_element)
        .add_child(
            dom.div().add_classes(["control-button", "admin-button"]).text("Admin").parent(this.container_element)
            .add_event("click", () => {
                if (this.admin_controls_shown_flag) 
                    this.hide_admin_controls();
                else 
                    this.show_admin_controls();
            })
        );
        this.admin_password_input_element = dom.input().parent(admin_container_element).add_class("password-input");
        this.admin_control_buttons_container_element = dom.div().add_class("control-buttons-container").parent(admin_container_element);
        let admin_login_button_element = dom.div().parent(this.admin_control_buttons_container_element).add_classes(["control-button", "login-button"]).text("Admin Login")
            .add_event("click", () => this.admin_login());
        let admin_logout_button_element = dom.div().parent(this.admin_control_buttons_container_element).add_classes(["control-button", "logout-button"]).text("Admin Logout")
            .add_event("click", () => this.admin_logout());
            
        this.update_score_element();
        this.hide_admin_controls();

        this.end_element = dom.div().add_class("end").text("Quiz Completed!");
        this.initialized_flag = false;
        this.end_flag = false;
        this.admin_logged_in_flag = false;
        this.admin_controls_shown_flag = false;
    }
    add_quiz(quiz_form) { this.quiz_forms.push(quiz_form); }
    add_quizzes(quiz_forms) { quiz_forms.forEach(quiz_form => this.add_quiz(quiz_form)); }
    get_elem() { return this.container_element.get_elem(); }   
    update_score_element() { this.score_element.text(`Score: ${this.score}`); }
    update_score(score) { 
        this.score += score;
        this.update_score_element();
    }   
    set_end_flag(value) { this.end_flag = value; }
    is_end() { return this.end_flag; }
    insert_quiz(index) { this.container_element.insert_child_at(0, this.quiz_forms[index]); }
    replace_quiz(index) { this.container_element.replace_child(this.container_element.get_child_at(0), this.quiz_forms[index]); }
    initialize() { 
        this.current_quiz = 0;
        if (this.initialized_flag) {
            this.replace_quiz(0);
        } else {
            this.insert_quiz(0);
            this.initialized_flag = true;
        }
        this.score = 0;
        this.update_score_element(); 
        this.set_end_flag(false);
    }  
    show_quiz(index) {
        if (this.is_end())
            this.set_end_flag(false);
        this.container_element.replace_child(this.container_element.get_child_at(0), this.quiz_forms[index]);
    }
    show_next_quiz() { 
        if (this.current_quiz + 1 < this.quiz_forms.length) {
            this.current_quiz += 1;
            this.show_quiz(this.current_quiz);
        } else {
            this.show_end();
        }
    }
    show_previous_quiz() { 
        if (this.is_end()) {
            this.show_quiz(this.quiz_forms.length - 1);
        } else if (this.current_quiz - 1 >= 0) {
            this.current_quiz -= 1;
            this.show_quiz(this.current_quiz);
        }
    }
    show_end() {
        if (this.is_end()) return;
        this.set_end_flag(true);
        this.container_element.replace_child(this.container_element.get_child_at(0), this.end_element);
    }
    reset() {
        for (let quiz_form of this.quiz_forms) {
            quiz_form.reset();
        }
        this.initialize();
    }
    admin_login() {
        if (this.admin_logged_in_flag) return;
        let input_value = this.admin_password_input_element.get_value();
        if (input_value !== "admin") return;
        this.admin_logged_in_flag = true;
        this.admin_password_input_element.value("");
        for (let quiz_form of this.quiz_forms) 
            quiz_form.show_explanation();
        console.log("Admin logged in.");
    }
    admin_logout() {
        if (!this.admin_logged_in_flag) return;
        this.admin_logged_in_flag = false;
        for (let quiz_form of this.quiz_forms) 
            quiz_form.hide_explanation();
        console.log("Admin logged out.");
    }
    show_admin_controls() { 
        this.admin_controls_shown_flag = true;
        this.admin_password_input_element.remove_class("hidden");
        this.admin_control_buttons_container_element.remove_class("hidden"); 
    }
    hide_admin_controls() { 
        this.admin_controls_shown_flag = false;
        this.admin_password_input_element.add_class("hidden");
        this.admin_control_buttons_container_element.add_class("hidden"); 
    }
}

class QuizForm {
    constructor(quiz_player, quiz_info) {
        this.quiz_player = quiz_player;
        this.quiz_info = quiz_info;
        this.option_elements = [];
        this.selected_option_count = 0;
        
        this.is_explanation_visible = false;
        this.is_quiz_answered = false;
        
        this.form_element = dom.div().add_class("quiz-form");
        dom.div().add_class("quiz-question").parent(this.form_element).text(this.quiz_info.get_question());
        for (let option of this.quiz_info.get_options()) {
            let option_object = {
                button: dom.div().add_class("quiz-option").parent(this.form_element).text(option.get_text()),
                is_selected: false
            };
            this.option_elements.push(option_object);
            option_object.button.add_event("click", () => {
                if (this.is_quiz_answered) return;
                if (option_object.is_selected) {
                    option_object.is_selected = false;
                    option_object.button.remove_class("selected");
                } else {
                    option_object.is_selected = true;
                    option_object.button.add_class("selected");
                }
            });
        }
        dom.div().text("Confirm").parent(this.form_element).add_classes(["control-button", "reset-button"])
        .add_event("click", () => {
            let selected_count = 0, correct_selected_count = 0;
            for (let [option_element, option] of zip(this.option_elements, this.quiz_info.get_options())) {
                if (option_element.is_selected) {
                    selected_count += 1;
                    option_element.button.remove_class("selected");
                    if (option.is_correct())
                        correct_selected_count += 1;
                }
                if (option.is_correct()) {
                    option_element.button.add_class("correct-option");
                } else {
                    option_element.button.add_class("wrong-option");
                }
            }
            this.is_quiz_answered = true;
            this.show_explanation();
            let score = selected_count > 0 ? correct_selected_count / selected_count : 0;
            this.quiz_player.update_score(score);
        });
       
        this.explanation_element = dom.div().text(this.quiz_info.get_explanation()).parent(this.form_element).add_classes(["explanation", "hidden"]);
    }
    show_explanation() {
        if (this.is_explanation_visible) return;
        this.explanation_element.remove_class("hidden");
        this.is_explanation_visible = true;
    }
    hide_explanation() {
        if (!this.is_explanation_visible) return;
        this.explanation_element.add_class("hidden");
        this.is_explanation_visible = false;
    }

    reset() {
        for (let option_element of this.option_elements) {
            option_element.button.remove_class("correct-option");
            option_element.button.remove_class("wrong-option");
            option_element.button.remove_class("selected");
            option_element.is_selected = false;
        }
        this.hide_explanation();
        this.is_quiz_answered = false;
    }
    get_elem() { return this.form_element.get_elem(); }
}

class QuizOption {
    constructor(text, is_correct) {
        this._text = text;
        this._is_correct = is_correct;
    }
    text(text) { this._text = text; return this; }
    correct(bool) { this._is_correct = bool; return this; }
    get_text() { return this._text; }
    is_correct() { return this._is_correct; }
}
class QuizInfo {
    constructor() {
        this._question = "";
        this._options = [];
        this._explanation = "";
    }
    question(question) { this._question = question; return this; }
    options(options) { this._options = options; return this; }
    add_option(option) { this._options.push(option); return this; }
    option_at(index, option) { this._options[index] = option; return this; }
    remove_option_at(index) { this._options.splice(index, 1); return this; }
    remove_option(option) { this._options = this._options.filter(opt => opt !== option); return this; }
    explanation(explanation) { this._explanation = explanation; return this; }
    insert_option_at(index, option) { this._options.splice(index, 0, option); return this; }

    get_option_index(option) { return this._options.indexOf(option); }
    get_question() { return this._question; }
    get_options() { return this._options; }
    get_option_at(index) { return this._options[index]; }
    get_correct_option(index) { return this._options[this._correct_option_indices[index]]; }
    get_explanation() { return this._explanation; }
    get_correct_option_count() { 
        let count = 0;
        for (let option of this._options)
            if (option.is_correct()) count += 1;
        return count;
    }
}

class QuizManager {
    constructor() {
        this.quiz_infos = [];
    }
    add_quiz_info(quiz_info) { this.quiz_infos.push(quiz_info); }
    add_quiz_infos(quiz_infos) { quiz_infos.forEach(quiz_info => this.add_quiz_info(quiz_info)); }
    get_quiz_info(index) { return this.quiz_infos[index]; }
    get_quiz_infos() { return this.quiz_infos; }
    remove_quiz_info(index) { this.quiz_infos.splice(index, 1); }
    insert_quiz_info_at(index, quiz_info) { this.quiz_infos.splice(index, 0, quiz_info); }
}

class QuizEditor {
    constructor(quiz_manager) {
        this.quiz_manager = quiz_manager;
        dom.button().text("Refresh").parent(dom.get_body()).add_event("click", () => this.initialize());
        this.element = dom.div().add_class("quiz-editor");
        dom.div().text("Quiz Editor - Under Construction").parent(this.element);
    }
    initialize() {
        this.element.clear();
        for (let quiz_info of this.quiz_manager.get_quiz_infos()) {
            this.element.add_child(
                this.quiz_component(quiz_info)
            );
        }
    }
    get_elem() { return this.element.get_elem(); }
    quiz_option_component(options_container_element, option_add_button, quiz_info, option) {
        let option_container_element = dom.div().add_class("option-container");
        let option_element = dom.div().add_class("option").text(option.get_text()).parent(option_container_element).content_editable(true).add_event("input", e => option.text(e.target.innerText));
        let option_select_button = dom.div().add_class("option-button").text("X").parent(option_container_element);
        if (option.is_correct()) {
            option_element.add_class("selected");
            option_select_button.add_class("selected");
        }
        option_select_button.add_event("click", () => {
            if (option_select_button.has_class("selected")) {
                option_select_button.remove_class("selected");
                option_element.remove_class("selected");
                option.correct(false);
            } else {
                option_select_button.add_class("selected");
                option_element.add_class("selected");
                option.correct(true);
            }
        });
        let option_remove_button = dom.div().add_classes(["option-button", "option-remove-button"]).parent(option_container_element).text("-")
        .add_event("click", () => {
            options_container_element.remove_child(option_container_element);
            quiz_info.remove_option(option);
            option.correct(false);
            options_container_element.remove_child(option_add_button);
        });
        return option_container_element;
    }
    quiz_component(quiz_info) {
        let container_element = dom.div().add_class("quiz-component");
        dom.div().add_class("question-label").text("Question:").parent(container_element);
        dom.div().add_class("question").text(quiz_info.get_question()).parent(container_element).content_editable(true).add_event("input", e => quiz_info.question(e.target.innerText));
        let options_container_element = dom.div().add_class("options").parent(container_element);
        
        let option_add_button_component = () => {
            let option_add_button = dom.div().add_class("option-add-button").text("+")
            .add_event("click", () => option_add_button_callback(option_add_button));
            return option_add_button;
        };
        let option_add_button_callback = (old_option_add_button) => {
            let new_option = new QuizOption("New Option", false);
            let button_index = options_container_element.get_child_index(old_option_add_button);
            quiz_info.insert_option_at(button_index / 2, new_option);
            let option_add_button = option_add_button_component();
            options_container_element.insert_child_at(button_index, option_add_button);
            options_container_element.insert_child_at(button_index + 1, 
                this.quiz_option_component(options_container_element, option_add_button, quiz_info, new_option));
        };

        for (let option of quiz_info.get_options()) {
            let option_add_button = option_add_button_component().parent(options_container_element);
            this.quiz_option_component(options_container_element, option_add_button, quiz_info, option).parent(options_container_element);
        }
        option_add_button_component().parent(options_container_element);        

        dom.div().add_class("explanation-label").text("Explanation:").parent(container_element);
        dom.div().add_class("explanation").text(quiz_info.get_explanation()).parent(container_element).content_editable(true)
        .add_event("input", e => quiz_info.explanation(e.target.innerText));
        return container_element;
    }
}


dom.on_page_load(() => {
    let body = dom.get_body();

    let quiz_manager = new QuizManager();
    quiz_manager.add_quiz_infos([
        new QuizInfo().question("What is the capital of France?")
            .options([new QuizOption("Berlin", false), new QuizOption("Madrid", false), new QuizOption("Paris", true), new QuizOption("Rome", false)])
            .explanation("Paris is the capital and most populous city of France."),
        new QuizInfo().question("Which planet is known as the Red Planet?")
            .options([new QuizOption("Earth", false), new QuizOption("Mars", true), new QuizOption("Jupiter", false), new QuizOption("Saturn", false)])
            .explanation("Mars is often called the 'Red Planet' because of its reddish appearance."),
        new QuizInfo().question("What is the largest ocean on Earth?")
            .options([new QuizOption("Atlantic Ocean", false), new QuizOption("Indian Ocean", false), new QuizOption("Arctic Ocean", false), new QuizOption("Pacific Ocean", true)])
            .explanation("The Pacific Ocean is the largest and deepest of Earth's oceanic divisions."),
        new QuizInfo().question("Who wrote 'Romeo and Juliet'?")
            .options([new QuizOption("Charles Dickens", false), new QuizOption("William Shakespeare", true), new QuizOption("Mark Twain", false), new QuizOption("Jane Austen", false)])
            .explanation("'Romeo and Juliet' is a tragedy written by William Shakespeare early in his career."),
        new QuizInfo().question("What is the chemical symbol for gold?")
            .options([new QuizOption("Au", true), new QuizOption("Ag", false), new QuizOption("Fe", false), new QuizOption("Pb", false)])
            .explanation("The chemical symbol for gold is 'Au', derived from the Latin word 'Aurum'."),
        new QuizInfo().question("Which organ in the human body is responsible for pumping blood?")
            .options([new QuizOption("Lungs", false), new QuizOption("Liver", false), new QuizOption("Heart", true), new QuizOption("Kidneys", false)])
            .explanation("The heart is a muscular organ that pumps blood through the blood vessels of the circulatory system."),
    ]);
    let quiz_editor = new QuizEditor(quiz_manager);
    quiz_editor.initialize();
    
    
    let quiz_player = new QuizPlayer();   
    for (let quiz_info of quiz_manager.get_quiz_infos()) {
        quiz_player.add_quiz(new QuizForm(quiz_player, quiz_info));
    }
    quiz_player.initialize();
    
        
    body.add_child(quiz_player);
    
});