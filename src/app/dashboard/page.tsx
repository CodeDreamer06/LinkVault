'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabaseClient';
import { ThemeToggle } from "@/components/theme-toggle";
import { suggestTagsFromText } from "@/lib/aiService";
import { Loader2 } from "lucide-react";
import { saveAs } from 'file-saver';
import { toast } from "sonner";
import { Settings, Upload, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the Link type
interface LinkType {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  tags: string[]; // Assuming tags are stored as an array of strings in jsonb
  category: string | null;
  created_at: string; // Keep as string from DB, format later
  favicon_url?: string | null; // <-- Add favicon URL
  // Add other fields if needed, e.g., thumbnail
}

const DashboardPage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- Dialog Mode State ---
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  // -------------------------

  // --- Form State (used for both Add and Edit) ---
  const [formLinkId, setFormLinkId] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState(''); // Comma-separated string
  const [formCategory, setFormCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Used for add/update
  const [formError, setFormError] = useState('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [formFaviconUrl, setFormFaviconUrl] = useState<string | null>(null); // <-- Add state for favicon
  // -----------------------------------------------

  // Link List State
  const [links, setLinks] = useState<LinkType[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState('');

  // Delete Link State
  const [linkToDelete, setLinkToDelete] = useState<LinkType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // --- Filter State ---
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // --------------------

  // --- Import/Export State ---
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input
  // ---------------------------

  // --- Derived State for Categories, Tags & Filtered Links ---
  const categories = useMemo(() => {
      const uniqueCategories = new Set<string>();
      links.forEach(link => {
          if (link.category) {
              uniqueCategories.add(link.category);
          }
      });
      return Array.from(uniqueCategories).sort(); // Sort alphabetically
  }, [links]);

  const tags = useMemo(() => {
      const uniqueTags = new Set<string>();
      links.forEach(link => {
          link.tags?.forEach(tag => uniqueTags.add(tag));
      });
      return Array.from(uniqueTags).sort(); // Sort tags alphabetically
  }, [links]);

  const filteredLinks = useMemo(() => {
      let result = links;
      const query = searchQuery.toLowerCase().trim();

      if (query) {
          result = links.filter(link => 
              link.url.toLowerCase().includes(query) ||
              link.title?.toLowerCase().includes(query) ||
              link.description?.toLowerCase().includes(query) ||
              link.category?.toLowerCase().includes(query) ||
              link.tags?.some(tag => tag.toLowerCase().includes(query))
          );
      } else if (selectedTag) {
          result = links.filter(link => link.tags?.includes(selectedTag));
      } else if (selectedCategory) {
          result = links.filter(link => link.category === selectedCategory);
      }
      
      return result;
  }, [links, selectedCategory, selectedTag, searchQuery]);
  // -----------------------------------------------------------

  // --- Helper to handle filter selection (clear search) ---
  const handleSelectCategory = (category: string | null) => {
      setSelectedCategory(category);
      setSelectedTag(null);
      setSearchQuery('');
  };

  const handleSelectTag = (tag: string | null) => {
      setSelectedTag(tag);
      setSelectedCategory(null);
      setSearchQuery('');
  };

  // Handler for clearing all filters (including search)
  const handleShowAllLinks = () => {
      setSelectedCategory(null);
      setSelectedTag(null);
      setSearchQuery('');
  }
  // -----------------------------------------------------

  // --- Redirect Logic (Moved Before Early Returns) ---
  // This hook MUST run unconditionally before any early returns.
  // The redirect logic itself is still conditional.
  useEffect(() => {
    // Only redirect if auth is resolved (!authLoading) and there's no user
    if (!authLoading && !user) {
      router.push('/login');
    }
    // No dependency on user here, just run once after initial auth check is done
  }, [authLoading, user, router]); // Add user dependency back
  // ---------------------------------------------------

  // Fetch Links Function
  const fetchLinks = useCallback(async () => {
    if (!user) return;

    setLinksLoading(true);
    setLinksError('');
    try {
      const { data, error } = await supabase
        .from('links')
        .select('id, url, title, description, tags, category, created_at, favicon_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setLinks((data as LinkType[]) || []);
    } catch (err: unknown) {
      console.error('Error fetching links:', err);
      const message = (err instanceof Error) ? err.message : 'Failed to load links.';
      setLinksError(message);
    } finally {
      setLinksLoading(false);
    }
  }, [user]);

  // Initial fetch on component mount
  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, fetchLinks]);

  // Reset Form Function
  const resetForm = () => {
      setFormLinkId(null);
      setFormUrl('');
      setFormTitle('');
      setFormDesc('');
      setFormTags('');
      setFormCategory('');
      setFormFaviconUrl(null); // <-- Reset favicon
      setFormError('');
      setIsSubmitting(false);
  };

  // Open Add Dialog
  const handleOpenAddDialog = () => {
      resetForm();
      setDialogMode('add');
  };

  // Open Edit Dialog
  const handleOpenEditDialog = (link: LinkType) => {
      setFormLinkId(link.id);
      setFormUrl(link.url);
      setFormTitle(link.title || '');
      setFormDesc(link.description || '');
      setFormTags(link.tags?.join(', ') || ''); // Join array back to string
      setFormCategory(link.category || '');
      setFormError('');
      setDialogMode('edit');
  };

  // Close Add/Edit Dialog
   const handleCloseDialog = () => {
      setDialogMode(null);
      // Optional: Reset form here too, or only when opening Add
      resetForm(); 
   };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        setFormError('You must be logged in.');
        return;
    }
    if (!formUrl) {
        setFormError('URL is required.');
        return;
    }

    setIsSubmitting(true);
    setFormError('');
    const tagsArray = formTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const linkData = {
        user_id: user.id,
        url: formUrl,
        title: formTitle || null,
        description: formDesc || null,
        tags: tagsArray,
        category: formCategory || null,
        favicon_url: formFaviconUrl // <-- Add favicon_url to data
    };

    try {
        let error: any = null;
        if (dialogMode === 'edit' && formLinkId) {
            // Update existing link
            const { error: updateError } = await supabase
                .from('links')
                .update(linkData)
                .match({ id: formLinkId });
            error = updateError;
        } else if (dialogMode === 'add') {
            // Insert new link
            const { error: insertError } = await supabase
                .from('links')
                .insert([linkData]); // Pass as array for insert
            error = insertError;
        }

        if (error) {
            throw error;
        }

        console.log(`Link ${dialogMode === 'edit' ? 'updated' : 'added'} successfully!`);
        handleCloseDialog(); // Close dialog and reset form
        fetchLinks(); // Refresh list

    } catch (err: unknown) {
        console.error(`Error ${dialogMode === 'edit' ? 'updating' : 'adding'} link:`, err);
        const baseMessage = `Failed to ${dialogMode === 'edit' ? 'update' : 'add'} link.`;
        const message = (err instanceof Error) ? err.message : 'Unknown error';
        setFormError(`${baseMessage} ${message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Handle Delete Link
  const handleDeleteClick = (link: LinkType) => {
    setLinkToDelete(link);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!linkToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .match({ id: linkToDelete.id });

      if (error) {
        throw error;
      }

      console.log('Link deleted successfully!', linkToDelete.id);
      setLinkToDelete(null);
      fetchLinks();

    } catch (err: unknown) {
      console.error('Error deleting link:', err);
      const message = (err instanceof Error) ? err.message : 'Failed to delete link.';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setLinkToDelete(null);
    setDeleteError('');
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut();
      // The AuthProvider's onAuthStateChange listener should ideally handle
      // redirecting to login after state update, but we can force it here too.
      router.push('/login'); 
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally show an error message to the user
    }
  };

  // Add state for AI suggestions
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  // --- Handle Suggest Tags Click ---
  const handleSuggestTags = async () => {
      const textToAnalyze = formDesc || formTitle || formUrl; // Use description, title, or URL
      if (!textToAnalyze) {
          setSuggestionError("Please enter a Description, Title, or URL first.");
          return;
      }
      setSuggestingTags(true);
      setSuggestionError('');
      setSuggestedTags([]);
      try {
          const tags = await suggestTagsFromText(textToAnalyze);
          setSuggestedTags(tags);
          if (tags.length === 0) {
              setSuggestionError("Couldn't suggest any tags. Try adding more details.");
          }
      } catch (error: unknown) {
          console.error("Tag suggestion failed:", error);
          const message = (error instanceof Error) ? error.message : 'Failed to get suggestions.';
          setSuggestionError(message);
      } finally {
          setSuggestingTags(false);
      }
  };
  // -------------------------------

  // --- Add Suggested Tag to Input ---
  const handleAddSuggestedTag = (tagToAdd: string) => {
      const currentTags = formTags.split(',').map(t => t.trim()).filter(t => t);
      if (!currentTags.includes(tagToAdd)) {
          setFormTags([...currentTags, tagToAdd].join(', '));
      }
      // Maybe remove the tag from suggestions after adding?
      setSuggestedTags(prev => prev.filter(t => t !== tagToAdd));
  };
  // ---------------------------------

  // --- Fetch Metadata Function ---
  const fetchMetadataForUrl = async (url: string) => {
      if (!url || !url.trim()) return;
      
      // Basic check: don't fetch if title is already manually filled
      if (formTitle.trim() !== '') return; 

      console.log("Attempting to fetch metadata for:", url);
      setIsFetchingMetadata(true);
      setFormError(''); // Clear previous form errors
      try {
          const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Failed to fetch metadata: ${response.statusText}`);
          }
          const metadata = await response.json();
          console.log("Received metadata:", metadata);

          // Auto-populate title
          if (formTitle.trim() === '' && metadata.title) {
              setFormTitle(metadata.title);
          }
          
          // Store favicon URL
          setFormFaviconUrl(metadata.favicon || null); // <-- Store fetched favicon

      } catch (error: unknown) {
          console.error("Metadata fetch error:", error);
          // Maybe use toast here instead of form error?
          // toast.error(`Could not fetch metadata: ${ (error instanceof Error) ? error.message : 'Unknown error' }`);
      } finally {
          setIsFetchingMetadata(false);
      }
  };
  // -----------------------------

  // --- Handle Export ---
  const handleExport = async () => {
      if (!user) return toast.error("You must be logged in to export.");
      setIsExporting(true);
      toast.info("Preparing export...");
      try {
          const { data, error, count } = await supabase
              .from('links')
              .select('url, title, description, tags, category, created_at, favicon_url', { count: 'exact' }) // Get count too
              .eq('user_id', user.id);
          
          if (error) throw error;
          if (!data || count === 0) {
               toast.warning("You have no links to export.");
               return;
          }

          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
          saveAs(blob, `link-vault-export-${new Date().toISOString().split('T')[0]}.json`);
          toast.success(`Exported ${count} links successfully!`);

      } catch (err: unknown) {
          console.error("Export failed:", err);
          const message = (err instanceof Error) ? err.message : 'Unknown error';
          toast.error(`Export failed: ${message}`);
      } finally {
          setIsExporting(false);
      }
  };
  // ---------------------

  // --- Handle Import Trigger ---
  const handleImportClick = () => {
      if (isImporting) return; // Prevent double click
      fileInputRef.current?.click();
  };
  // ---------------------------

  // --- Handle File Input Change (Process Import) ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!user) {
           toast.error("You must be logged in to import.");
           return;
      }

      if (fileInputRef.current) {
           fileInputRef.current.value = ""; // Allow re-importing same file
      }
      if (file.type !== 'application/json') {
          return toast.error("Import failed: Please select a valid JSON file.");
      }

      setIsImporting(true);
      toast.info("Importing links...");

      try {
          const content = await file.text();
          // Define type for imported link structure (can be loose)
          interface ImportedLink { 
              url: string; 
              title?: string | null;
              description?: string | null;
              tags?: (string | null | undefined)[]; // Allow variation
              category?: string | null;
              favicon_url?: string | null;
          }
          const importedLinks: ImportedLink[] = JSON.parse(content);

          if (!Array.isArray(importedLinks)) throw new Error("Invalid JSON format: Expected an array.");
          if (importedLinks.length === 0) return toast.warning("Import file contains no links.");
         
          const linksToInsert = importedLinks.map((link: ImportedLink, index: number) => {
              if (!link.url || typeof link.url !== 'string') {
                  throw new Error(`Invalid data at index ${index}: Missing/invalid URL.`);
              }
              // Filter tags more robustly
              const tags = (Array.isArray(link.tags) 
                  ? link.tags.filter((t): t is string => typeof t === 'string' && t.length > 0)
                  : []).map(t => t.trim()); // Also trim valid tags
              return {
                  user_id: user!.id,
                  url: link.url,
                  title: typeof link.title === 'string' ? link.title : null,
                  description: typeof link.description === 'string' ? link.description : null,
                  tags: tags,
                  category: typeof link.category === 'string' ? link.category : null,
                  favicon_url: typeof link.favicon_url === 'string' ? link.favicon_url : null,
              };
          });

          // TODO: Consider chunking for very large imports if needed
          const { error } = await supabase.from('links').insert(linksToInsert);
          if (error) throw error;

          toast.success(`Successfully imported ${linksToInsert.length} links!`);
          fetchLinks(); // Refresh list

      } catch (err: unknown) {
          console.error("Import failed:", err);
          const message = (err instanceof Error) ? err.message : 'Could not process file.';
          toast.error(`Import failed: ${message}`);
      } finally {
          setIsImporting(false);
      }
  };
  // ----------------------------------------------

  // Auth Loading Check
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Early return if no user AFTER hook has run
  if (!user) {
     return null; // Render nothing while redirecting (redirect handled by useEffect now)
  }

  // If logged in, show the dashboard content
  return (
    <AlertDialog open={!!linkToDelete} onOpenChange={(open) => !open && cancelDelete()}>
      <div className="flex h-screen bg-background">
        <aside className="w-64 border-r p-4 flex flex-col shrink-0">
          <h2 className="text-lg font-semibold mb-2">Categories</h2>
          <nav className="flex flex-col gap-1 mb-6 overflow-y-auto">
            <Button
              variant={selectedCategory === null && selectedTag === null && !searchQuery ? "secondary" : "ghost"}
              className="justify-start"
              onClick={handleShowAllLinks}
            >
              All Links
            </Button>
            {categories.map(category => (
              <Button 
                key={category}
                variant={selectedCategory === category ? "secondary" : "ghost"}
                className="justify-start truncate"
                onClick={() => handleSelectCategory(category)}
              >
                {category}
              </Button>
            ))}
          </nav>
          <h2 className="text-lg font-semibold mb-2 pt-4 border-t">Tags</h2>
          <nav className="flex flex-wrap gap-2 overflow-y-auto">
            {tags.length === 0 && !linksLoading && (
              <p className="text-sm text-muted-foreground">No tags used yet.</p>
            )}
            {tags.map(tag => (
              <Button 
                key={tag}
                variant={selectedTag === tag ? "secondary" : "outline"}
                size="sm"
                className="h-auto px-2 py-0.5"
                onClick={() => handleSelectTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </nav>
          <div className="mt-auto pt-4">
            {user && <p className="text-xs text-muted-foreground mb-2 truncate">{user.email}</p>}
            <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
          </div>
        </aside>
        <main className="flex-1 p-6 overflow-y-auto">
          <header className="flex justify-between items-center gap-4 mb-8">
            <div className="relative w-full max-w-md">
              <Input 
                type="search"
                placeholder="Search links (URL, title, description, tags...)"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim() !== '') { 
                      setSelectedCategory(null);
                      setSelectedTag(null);
                    } 
                }}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={dialogMode === 'add' || dialogMode === 'edit'} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenAddDialog} className="shrink-0">Add New Link</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{dialogMode === 'edit' ? 'Edit Link' : 'Add New Link'}</DialogTitle>
                    <DialogDescription>
                      {dialogMode === 'edit' 
                        ? 'Update the details for your link.' 
                        : 'Enter the details for the link you want to save.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFormSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="form-url" className="text-right">URL*</Label>
                        <div className="col-span-3 relative">
                          <Input 
                            id="form-url" 
                            type="url" 
                            value={formUrl} 
                            onChange={(e) => setFormUrl(e.target.value)} 
                            onBlur={(e) => fetchMetadataForUrl(e.target.value)}
                            className="col-span-3" 
                            required 
                            disabled={isSubmitting || isFetchingMetadata}
                          />
                          {isFetchingMetadata && (
                            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="form-title" className="text-right">Title</Label>
                        <Input 
                          id="form-title" 
                          value={formTitle} 
                          onChange={(e) => setFormTitle(e.target.value)} 
                          className="col-span-3" 
                          placeholder={isFetchingMetadata ? "Fetching title..." : "(Will auto-fetch if empty)"} 
                          disabled={isSubmitting || isFetchingMetadata}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="form-desc" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="form-desc"
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                          className="col-span-3"
                          placeholder="(Optional)"
                          disabled={isSubmitting}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="form-tags" className="text-right">Tags</Label>
                        <Input id="form-tags" value={formTags} onChange={(e) => setFormTags(e.target.value)} className="col-span-3" placeholder="Comma-separated" disabled={isSubmitting} />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <div className="col-start-2 col-span-3 flex flex-col gap-2">
                            <Button 
                              type="button" 
                              variant="outline"
                              size="sm"
                              onClick={handleSuggestTags}
                              disabled={suggestingTags || isSubmitting}
                              className="w-fit"
                            >
                               {suggestingTags ? (
                                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suggesting...</>
                                ) : (
                                  'Suggest Tags with AI'
                                )}
                             </Button>
                             {suggestionError && (
                                 <p className="text-xs text-destructive">{suggestionError}</p>
                             )}
                             {suggestedTags.length > 0 && (
                                 <div className="flex flex-wrap gap-1 pt-1">
                                     <span className="text-xs text-muted-foreground mr-1">Suggestions:</span>
                                     {suggestedTags.map(tag => (
                                         <Button 
                                             key={tag} 
                                             type="button" 
                                             variant="secondary" 
                                             size="sm"
                                             className="h-auto px-2 py-0.5 text-xs"
                                             onClick={() => handleAddSuggestedTag(tag)}
                                         >
                                             + {tag}
                                         </Button>
                                     ))}
                                 </div>
                             )}
                         </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="form-category" className="text-right">
                          Category
                        </Label>
                        <Input
                          id="form-category"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="col-span-3"
                          placeholder="(Optional)"
                          disabled={isSubmitting}
                        />
                      </div>
                       {formError && (
                        <p className="col-span-4 text-sm text-destructive text-center" role="alert">
                          {formError}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                       <DialogClose asChild>
                          <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
                        </DialogClose>
                      <Button type="submit" disabled={isSubmitting} aria-live="polite">
                        {isSubmitting ? (dialogMode === 'edit' ? 'Saving...' : 'Adding...') : (dialogMode === 'edit' ? 'Save Changes' : 'Add Link')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" disabled={isImporting || isExporting}>
                    <Settings className={`h-[1.2rem] w-[1.2rem] ${(isImporting || isExporting) ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Data Management</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleImportClick} disabled={isImporting || isExporting}>
                     <Upload className="mr-2 h-4 w-4" /> 
                     <span>Import from JSON...</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport} disabled={isImporting || isExporting}>
                     <Download className="mr-2 h-4 w-4" />
                     <span>{isExporting ? 'Exporting...' : 'Export to JSON'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <p className="mb-4">Logged in as: {user.email}</p>

          <div className="mt-6">
            <h2 className="text-xl mb-4 font-semibold">
              {searchQuery 
                ? `Search results for "${searchQuery}"`
                : selectedTag 
                ? `Tag: ${selectedTag}` 
                : (selectedCategory || 'All Links')}
            </h2>
            {linksLoading && <p>Loading links...</p>} 
            {linksError && <p className="text-destructive" role="alert">Error loading links: {linksError}</p>}
            {!linksLoading && !linksError && filteredLinks.length === 0 && (
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No links found matching "${searchQuery}".`
                  : selectedCategory 
                  ? `No links found in the "${selectedCategory}" category.`
                  : selectedTag
                  ? `No links found with the "${selectedTag}" tag.`
                  : 'You haven\'t added any links yet. Click "Add New Link" to start!'}
              </p>
            )}
            {!linksLoading && !linksError && filteredLinks.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLinks.map((link: LinkType) => (
                  <Card key={link.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start gap-2">
                        {link.favicon_url ? (
                          <Image 
                            src={link.favicon_url}
                            alt=""
                            width={16}
                            height={16}
                            className="mt-1 rounded-sm object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-4 h-4 mt-1 flex-shrink-0 rounded-sm bg-secondary"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg break-words">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {link.title || link.url}
                            </a>
                          </CardTitle>
                          {link.description && (
                            <CardDescription className="text-sm pt-1 break-words">{link.description}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2 pt-2">
                      {link.tags && link.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {link.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      {link.category && (
                        <p className="text-xs text-muted-foreground">Category: {link.category}</p>
                      )}
                    </CardContent>
                    <div className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(link.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" className="mr-1" onClick={() => handleOpenEditDialog(link)} disabled={isDeleting || isSubmitting}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(link)} disabled={isDeleting || isSubmitting}>Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the link titled &quot;<span className="font-medium">{linkToDelete?.title || linkToDelete?.url}</span>&quot;.
             {deleteError && (
                <p className="text-sm text-destructive mt-2" role="alert">Error: {deleteError}</p>
             )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete} 
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

      {/* Hidden File Input for Import */}
      <input 
         type="file" 
         ref={fileInputRef} 
         onChange={handleFileChange}
         accept="application/json" 
         style={{ display: 'none' }} 
      />
    </AlertDialog>
  );
};

export default DashboardPage; 