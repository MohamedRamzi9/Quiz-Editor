
import * as dom from "./lib/Dom.js";


class QuizManager {
    
    constructor() {
        this.quiz_forms = [];
        this.current_quiz = 0;
        this.score = 0;
        this.container_element = dom.div().add_class("quiz-manager");
        this.score_element = dom.div().add_class("score-display").parent(this.container_element);
        dom.div().add_class("buttons-container").parent(this.container_element)
        .add_child(
            dom.div().add_classes(["control-button", "previous-button"]).text("Previous").parent(this.container_element)
            .event("click", () => this.show_previous_quiz())
        ).add_child(
            dom.div().add_classes(["control-button", "next-button"]).text("Next").parent(this.container_element)
            .event("click", () => this.show_next_quiz())
        ).add_child(
            dom.div().add_classes(["control-button", "reset-all-button"]).text("Reset All").parent(this.container_element)
            .event("click", () => this.reset())
        );
        this.update_score_element();

        this.end_element = dom.div().add_class("end").text("Quiz Completed!");
        this.initialized_flag = false;
        this.end_flag = false;
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
}

class QuizForm {
    constructor(quiz_manager, question, options, correct_option_index, explanation) {
        this.quiz_manager = quiz_manager;
        this.question = question;
        this.options = options;
        this.correct_option_index = correct_option_index;
        this.option_elements = [];
        
        this.is_explanation_visible = false;
        this.is_quiz_answered = false;
        
        this.form_element = dom.div().add_class("quiz-form");
        dom.div().add_class("quiz-question").parent(this.form_element).text(this.question);
        for (let i=0; i<this.options.length; i++) {
            this.option_elements[i] = dom.div().add_class("quiz-option").parent(this.form_element).text(this.options[i])
            .event("click", () => {
                if (this.is_quiz_answered) return;
                this.is_quiz_answered = true;
                if (i === this.correct_option_index)
                    this.quiz_manager.update_score_correct();
                for (let j=0; j<this.option_elements.length; j++) {
                    if (j === this.correct_option_index)
                        this.option_elements[j].add_class("correct-option");
                    else
                        this.option_elements[j].add_class("wrong-option");
                }
                this.show_explanation();
            });
        }
        dom.div().text("Reset Quiz").parent(this.form_element).add_classes(["control-button", "reset-button"])
        .event("click", () => this.reset());
        this.explanation_element = dom.div().text(explanation).parent(this.form_element).add_classes(["explanation", "hidden"]);
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


dom.on_page_load(() => {
    let body = dom.get_body();
    let quiz_manager = new QuizManager();    
    let quiz_forms = [
        new QuizForm(quiz_manager, "What is 2 + 2?", ["3", "4", "5"], 1, "2 + 2 is 4."),
        new QuizForm(quiz_manager, "What is the capital of France?", ["Berlin", "London", "Paris"], 2, "The capital of France is Paris."),
        new QuizForm(quiz_manager, "What is the largest ocean?", ["Atlantic", "Indian", "Pacific"], 2, "The largest ocean is the Pacific Ocean."),
        new QuizForm(quiz_manager, "What is the smallest planet?", ["Mars", "Mercury", "Venus"], 1, "The smallest planet is Mercury."),
        new QuizForm(quiz_manager, "Who wrote 'Hamlet'?", ["Charles Dickens", "William Shakespeare", "Mark Twain"], 1, "'Hamlet' was written by William Shakespeare."),
    ]

    quiz_manager.add_quizzes(quiz_forms);
    quiz_manager.initialize();

    body.add_child(quiz_manager);
});