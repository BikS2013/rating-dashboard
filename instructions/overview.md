# Project High Level Description 
A dashboard page with a **sidebar** on the left side and the **dashboard** area to cover the rest of the page.

## Sidebar
In the **sidebar**, there is a dropdown that allows the user to select multiple items. The first item is labeled "all". Just right to the dropdown, there is also a checkbox. I call this checkbox the "expand" option.  
If I check the "all" option, everything in the dropdown must be selected. If I uncheck the "all", everything in the dropdown must be unselected. 
When I check the expand option, the drop-down must deactivated, and a list with the same options as the dropdown must appear.
The list disappears when I uncheck the expand option, and the drop-down becomes active again.
Be aware that the expand is about expanding the drop-down to the list. It is not about expanding the sidebar.
The dropdown lists users, and the “all” option must be pre-selected.

Under the user’s dropdown, there must be a dropdown to allow the selection of the time period. Various options must be available, such as Last day, Last Week, Last month, Last Quarter, etc. 
Under the Time Period selection drop-down, there must be two date selection fields: the from-date and to-date field, to allow arbitrary selection of the time period. The fields must be editable. They must offer a calendar drop-down helper and the date format must be dd/mm/yyyy.
When the user is selecting an option in the time period drop-down the from-date and to-date fields must get the right values to reflect the selection. 

Under the time period selection section there must be an area that allows user to select the kind of items included in the dashboard. 
The dashdoard aims to to present end-user ratings for a chatbot application. The ratings can be negative from 1 to 10 or positive from 1 to 10. So the items selection area must contain a list of options like: All, Negative, Positive, relatively neutral (-3 to +3), heavily positive, heavily negative, etc. 

I want the sidebar to be in dark color and offer the option to expand or collapse releasing space to the actual dashboard.

## Dashboard
The actual **dashboard** must have a top panel which will present the selection criteria. 
Under this one there must be a panel with a bar chart presenting the data for each date in the selected period. 
The bars must be stacked bars to present n the same bar the various ratings.

Under the barchart area there must be a rating summary area, with tiles for each rating, presenting the number of votes for the specific rating.
The Rating Summary tiles must be placed in a horizontal layout. 
The tiles must represent high level categories (Positive, Negative, Neutral, Heavily Positive and Negative) not the detailed rating values.
There must be tiles only for the categories that have ratings, not for the empties.

When the user click on a tile in the rating summary area,
I want you to open an area under the rating summary area, where the detailed ratings will be presented. 
This area must have two tabs. 
The first tab will contain the detailed rating information. 
For each rating I want you to present the rating and the exact message which rated by the user.
From the message the first 100 characters will be displayed, and the user must be able to expand the full message and/or the full discussion where the message belongs.
The second tab must contain a barchart representing the distribution of the selected ratings among the various users. 
