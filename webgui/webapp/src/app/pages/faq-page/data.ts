import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface FaqItem {
  title: string;
  html: string; // keep as raw string, sanitizer will handle in component
}

export interface StepByItem {
  title: string;
  url: string;
  no?: number;
  image?: string;
}

export const faqItemsData: FaqItem[] = [
  {
    title: 'What is the Global Filter Term?',
    html: `
       <div class="flex flex-col gap-2">
          <div class="flex justify-center items-center bg-gray-50 py-8">
            <img
              class="w-1/2"
              alt="result table"
              src="assets/images/faq/result-table.png"
            />
          </div>
          <div class="text-black font-normal">
            Enable query of a specific string of letters/words within the result
            table. Note that this feature queries the term globally, meaning
            that any term specified that matches somewhere within the results
            entries. Hence, Users might only see the closed variant cards unless
            each of the variant card is opened to manually check the presence of
            the specified term
          </div>
        </div>
    `,
  },
  {
    title: 'What is the Advanced Filter?',
    html: `
        <div class="flex flex-col gap-2">
          <div class="flex justify-center items-center bg-gray-50 py-8">
            <img
              class="w-1/2"
              alt="result table"
              src="assets/images/faq/advanced-filter.png"
            />
          </div>
          <div class="text-black font-normal">
            Enable query of a specific string of letters/words per available
            columns within the result table, and can be combined for sequential
            filtering purposes. This feature uses the "AND" logic, so when the
            parameters are added, only the specific entry(ies) with the
            parameters will be shown. To note, when the parameters were added
            sequentially, where one parameter is filtered first, then the second
            parameter will only filter the currently filtered/shown result in
            the UI. Hence, if combined parameters are to be used, the User is
            encouraged to enter the parameters first before clicking on the
            "Filter" button.
          </div>
        </div>
    `,
  },
];

export const stepData: StepByItem[] = [
  {
    no: 0,
    image: 'assets/images/faq/advanced-filter-thumbnail.png',
    title: 'How to Use the Advanced Filter?',
    url: 'faq/advanced-filter',
  },
  {
    no: 1,
    image: 'assets/images/faq/annotation-thumbnail.png',
    title: 'How to Add Custom Annotation?',
    url: 'faq/annotation',
  },
  {
    no: 2,
    image: 'assets/images/faq/generate-report-thumbnail.png',
    title: 'How to Generate Clinical Report?',
    url: 'faq/generate-report',
  },
];
