import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface AgreementComment {
  id: string;
  agreement_id: string;
  user_id: string;
  comment_text: string;
  comment_type: 'comment' | 'observation' | 'status_change';
  old_status?: string;
  new_status?: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
}

export const useAgreementComments = (agreementId: string) => {
  const [comments, setComments] = useState<AgreementComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agreement_comments')
        .select('*')
        .eq('agreement_id', agreementId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch user data separately for each comment
      const commentsWithUsers = await Promise.all((data || []).map(async (comment) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', comment.user_id)
          .single();

        return {
          ...comment,
          user: userError ? undefined : userData
        };
      }));
      
      setComments(commentsWithUsers as AgreementComment[]);
    } catch (error: any) {
      toast({
        title: "Error al cargar comentarios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentText: string, commentType: 'comment' | 'observation' | 'status_change' = 'comment', statusData?: { oldStatus?: string; newStatus?: string }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('agreement_comments')
        .insert([{
          agreement_id: agreementId,
          user_id: authData.user.id,
          comment_text: commentText,
          comment_type: commentType,
          old_status: statusData?.oldStatus,
          new_status: statusData?.newStatus
        }])
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: "Comentario agregado",
        description: "El comentario se ha agregado exitosamente",
      });

      await fetchComments();
      return data;
    } catch (error: any) {
      toast({
        title: "Error al agregar comentario",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateComment = async (commentId: string, commentText: string) => {
    try {
      const { data, error } = await supabase
        .from('agreement_comments')
        .update({ comment_text: commentText })
        .eq('id', commentId)
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: "Comentario actualizado",
        description: "El comentario se ha actualizado exitosamente",
      });

      await fetchComments();
      return data;
    } catch (error: any) {
      toast({
        title: "Error al actualizar comentario",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('agreement_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado exitosamente",
      });

      await fetchComments();
    } catch (error: any) {
      toast({
        title: "Error al eliminar comentario",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (agreementId) {
      fetchComments();
    }
  }, [agreementId]);

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    updateComment,
    deleteComment
  };
};