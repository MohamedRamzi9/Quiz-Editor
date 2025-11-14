

# 14-11-2025
- fixed removing selected option causing wrong option to be selected when refreshing
- changed `quiz_option_component` method to return the element instead of adding it to the parent directly
- moved the add option button creation and event binding outside of the `quiz_option_component` method  
- implemented the add option button to insert new option component before itself when clicked
- added the last option add button to be created after all existing options are created
- changed `QuizPlayer` to work with multiple correct options
- changed reset button in `QuizForm` to confirm selected options instead of resetting the quiz
- changed score updating to give partial score based on number of correct options selected over total selected options 


# 13-11-2025
- added option add button to without functionality
- extracted quiz option component into its own method `quiz_option_component`
- changed quiz correct option to be multiple select instead of single select
- added `add_correct_option_index, remove_correct_option_index, get_correct_option_indices` methods to `QuizInfo` class
- added remove option button fully functional

# 12-11-2025
- created `QuizEditor` class to manage the quiz editing interface and functionality
  - created the structure of the editor and created quiz component
    - added content editable, option selection to the component
- added `option_at, get_option` method to `QuizInfo` class

# 08-11-2025
- fixed `event` method of dom elements to match latest library updates
- renamed `QuizManager` to `QuizPlayer` for better clarity 
- added `QuizInfo` class to encapsulate quiz data
- added new class `QuizManager` to handle storing and managing quizzes information

# 30-10-2025
- created version 1.0 of Quiz Editor application
