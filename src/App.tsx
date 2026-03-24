import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { CandidateList } from './components/Dashboard/CandidateList';
import { CandidateForm } from './components/Dashboard/CandidateForm';
import { CandidateFilters } from './components/Dashboard/CandidateFilters';
import { Analytics } from './components/Dashboard/Analytics';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import { Candidate, FilterOptions } from './types';
import { searchAndFilterCandidates } from './utils/searchAlgorithm';

function App() {
  const [session, setSession] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadCandidates = async () => {
    if (!session?.user) {
      console.log('No session user, skipping load');
      return;
    }


    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading candidates:', error);
        setError('Failed to load candidates');
      } else {
        console.log('Candidates data from DB:', data);
        console.log('Number of candidates:', data?.length);
        setCandidates(data || []);
      }
    } catch (error) {
      console.error('Exception in loadCandidates:', error);
      setError('Failed to load candidates');
    }
  };

  // Setup realtime
  const setupRealtimeSubscription = () => {
    if (!session?.user) return;

    const subscription = supabase
      .channel('candidates_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'candidates',
        filter: `user_id=eq.${session.user.id}`
      }, () => {
        console.log('Realtime update received');
        loadCandidates();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  // Khởi tạo auth và load data
  useEffect(() => {
    const init = async () => {

      setLoading(true);

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession?.user?.id);

        setSession(initialSession);
        if (initialSession) {
          await loadCandidates();
          setupRealtimeSubscription();
        }
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to initialize');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    init();

    return () => {
      const sub = setupRealtimeSubscription();
      if (sub) sub();
    };
  }, []);

  // Theo dõi thay đổi session
  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log('Auth state changed:', _event);
      setSession(newSession);

      if (newSession) {
        await loadCandidates();
        setupRealtimeSubscription();
      } else {
        setCandidates([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialized]);

  const handleAddCandidate = async (candidateData: any) => {
    try {
      setError(null);

      // Upload resume to storage
      const file = candidateData.resume;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${session?.user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('add-candidate', {
        body: {
          full_name: candidateData.full_name,
          applied_position: candidateData.applied_position,
          skills: candidateData.skills.split(',').map((s: string) => s.trim()),
          resume_url: publicUrl
        }
      });

      if (error) throw error;

      // Refresh list
      await loadCandidates();
    } catch (error) {
      console.error('Error adding candidate:', error);
      setError(error instanceof Error ? error.message : 'Failed to add candidate');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update successful!');
      await loadCandidates();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      setError('Failed to delete candidate');
    }
  };

  const filteredCandidates = searchAndFilterCandidates(candidates, filters);

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-4">Configuration Error</h2>
            <p>{error}</p>
            <p className="mt-4 text-sm text-gray-600">
              Please make sure you have created a .env file with:
              <br />
              VITE_SUPABASE_URL=your_url
              <br />
              VITE_SUPABASE_ANON_KEY=your_key
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100">
        {showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Candidate Management System
          </h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <Analytics candidates={candidates} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CandidateForm onSubmit={handleAddCandidate} />
          </div>

          <div className="lg:col-span-2">
            <CandidateFilters onFilterChange={setFilters} />
            <CandidateList
              candidates={filteredCandidates}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteCandidate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;