
import * as dom from "./lib/Dom.js";


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
    update_score_correct() { 
        this.score += 1;
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
    constructor(quiz_manager, quiz_info) {
        this.quiz_manager = quiz_manager;
        this.quiz_info = quiz_info;
        this.option_elements = [];
        
        this.is_explanation_visible = false;
        this.is_quiz_answered = false;
        
        this.form_element = dom.div().add_class("quiz-form");
        dom.div().add_class("quiz-question").parent(this.form_element).text(this.quiz_info.get_question());
        for (let i=0; i<this.quiz_info.get_options().length; i++) {
            this.option_elements[i] = dom.div().add_class("quiz-option").parent(this.form_element).text(this.quiz_info.get_options()[i])
            .add_event("click", () => {
                if (this.is_quiz_answered) return;
                this.is_quiz_answered = true;
                if (i === this.quiz_info.get_correct_option_index())
                    this.quiz_manager.update_score_correct();
                for (let j=0; j<this.option_elements.length; j++) {
                    if (j === this.quiz_info.get_correct_option_index())
                        this.option_elements[j].add_class("correct-option");
                    else
                        this.option_elements[j].add_class("wrong-option");
                }
                this.show_explanation();
            });
        }
        dom.div().text("Reset Quiz").parent(this.form_element).add_classes(["control-button", "reset-button"])
        .add_event("click", () => this.reset());
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
            option_element.remove_class("correct-option");
            option_element.remove_class("wrong-option");
        }
        this.hide_explanation();
        this.is_quiz_answered = false;
    }
    get_elem() { return this.form_element.get_elem(); }
}

class QuizInfo {
    constructor() {
        this._question = "";
        this._options = [];
        this._correct_option_index = -1;
        this._explanation = "";
    }
    question(question) { this._question = question; return this; }
    options(options) { this._options = options; return this; }
    add_option(option) { this._options.push(option); return this; }
    correct_option_index(correct_option_index) { this._correct_option_index = correct_option_index; return this; }
    explanation(explanation) { this._explanation = explanation; return this; }

    get_question() { return this._question; }
    get_options() { return this._options; }
    get_correct_option_index() { return this._correct_option_index; }
    get_explanation() { return this._explanation; }
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
}

class QuizEditor {
    constructor() {
        this.element = dom.div().add_class("quiz-editor");
        dom.div().text("Quiz Editor - Under Construction").parent(this.element);
    }
}


dom.on_page_load(() => {
    let body = dom.get_body();

    let quiz_manager = new QuizManager();
    quiz_manager.add_quiz_infos([
        new QuizInfo().question("What is the capital of France?").options(["Berlin", "Madrid", "Paris", "Rome"]).correct_option_index(2).explanation("Paris is the capital and most populous city of France."),
        new QuizInfo().question("Which planet is known as the Red Planet?").options(["Earth", "Mars", "Jupiter", "Saturn"]).correct_option_index(1).explanation("Mars is often called the 'Red Planet' because of its reddish appearance."),
        new QuizInfo().question("What is the largest ocean on Earth?").options(["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"]).correct_option_index(3).explanation("The Pacific Ocean is the largest and deepest of Earth's oceanic divisions."),
        new QuizInfo().question("Who wrote 'Romeo and Juliet'?").options(["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"]).correct_option_index(1).explanation("'Romeo and Juliet' is a tragedy written by William Shakespeare early in his career."),
        new QuizInfo().question("What is the chemical symbol for gold?").options(["Au", "Ag", "Fe", "Pb"]).correct_option_index(0).explanation("The chemical symbol for gold is 'Au', derived from the Latin word 'Aurum'.")
    ]);
    
    let quiz_player = new QuizPlayer();   
    for (let quiz_info of quiz_manager.get_quiz_infos()) {
        quiz_player.add_quiz(new QuizForm(quiz_player, quiz_info));
    }
    quiz_player.initialize();

    body.add_child(quiz_player);
    
});