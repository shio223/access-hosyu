import { SearchResultsWindow } from "@/components/access/search-results-window";
import { customerSearchResults } from "@/lib/master-data";

export default function CustomerSearchResultsPage() {
  return (
    <SearchResultsWindow
      title="F-得意先マスタ検索結果"
      formTitle="得意先マスタ検索結果"
      rows={customerSearchResults}
    />
  );
}
