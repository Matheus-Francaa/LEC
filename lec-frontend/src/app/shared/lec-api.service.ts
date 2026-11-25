import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Answer, FieldComment, LecData, Question, RulesResult, StatusLEC } from './models';

interface ApiAnswer {
  perguntaId: string;
  valor: string;
  origem: Answer['origem'];
  atualizadoEm: string;
}

interface ApiComment {
  id: string;
  perguntaId: string;
  texto: string;
  resolvido: boolean;
  criadoEm: string;
}

interface ApiLec {
  id: string;
  nomeSolucao: string;
  especialistaResponsavel: string | null;
  status: StatusLEC;
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
  classification: { grupo: string | null; tipo: string | null; subtipo: string | null };
  respostas: Record<string, ApiAnswer>;
  comentarios: ApiComment[];
  resultadoRules: RulesResult;
  parecerDevolucao: string | null;
  planoExecucao: string | null;
}

export interface LecSaveRequest {
  nomeSolucao: string;
  especialistaResponsavel: string;
  classification: { grupo: string; tipo: string; subtipo?: string };
  respostas: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class LecApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLecs(status?: string): Observable<LecData[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiLec[]>(`${this.baseUrl}/lecs`, { params })
      .pipe(map(lecs => lecs.map(lec => this.toLecData(lec))));
  }

  getLec(id: string): Observable<LecData> {
    return this.http.get<ApiLec>(`${this.baseUrl}/lecs/${id}`)
      .pipe(map(lec => this.toLecData(lec)));
  }

  createLec(nomeSolucao: string, especialistaResponsavel: string): Observable<LecData> {
    return this.http.post<ApiLec>(`${this.baseUrl}/lecs`, { nomeSolucao, especialistaResponsavel })
      .pipe(map(lec => this.toLecData(lec)));
  }

  updateLec(id: string, request: LecSaveRequest): Observable<LecData> {
    return this.http.put<ApiLec>(`${this.baseUrl}/lecs/${id}`, request)
      .pipe(map(lec => this.toLecData(lec)));
  }

  submitLec(id: string): Observable<LecData> {
    return this.http.post<ApiLec>(`${this.baseUrl}/lecs/${id}/submit`, {})
      .pipe(map(lec => this.toLecData(lec)));
  }

  returnLec(id: string, parecer: string): Observable<LecData> {
    return this.http.post<ApiLec>(`${this.baseUrl}/lecs/${id}/return`, { texto: parecer })
      .pipe(map(lec => this.toLecData(lec)));
  }

  approveLec(id: string, planoExecucao: string): Observable<LecData> {
    return this.http.post<ApiLec>(`${this.baseUrl}/lecs/${id}/approve`, { texto: planoExecucao })
      .pipe(map(lec => this.toLecData(lec)));
  }

  addComment(id: string, perguntaId: string, texto: string): Observable<FieldComment> {
    return this.http.post<ApiComment>(`${this.baseUrl}/lecs/${id}/comments`, { perguntaId, texto })
      .pipe(map(comment => this.toComment(comment)));
  }

  deleteComment(id: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/lecs/${id}/comments/${commentId}`);
  }

  deleteLec(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/lecs/${id}`);
  }

  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/questions`);
  }

  getClassificationGroups(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/classification-groups`);
  }

  private toLecData(lec: ApiLec): LecData {
    const answers: Record<string, Answer> = {};
    for (const [id, answer] of Object.entries(lec.respostas || {})) {
      answers[id] = {
        perguntaId: answer.perguntaId,
        valor: answer.valor,
        origem: answer.origem,
        atualizadoEm: new Date(answer.atualizadoEm)
      };
    }

    return {
      header: {
        id: lec.id,
        nomeSolucao: lec.nomeSolucao,
        especialistaResponsavel: lec.especialistaResponsavel || '',
        status: lec.status,
        versao: lec.versao,
        criadoEm: new Date(lec.criadoEm),
        atualizadoEm: new Date(lec.atualizadoEm)
      },
      classification: {
        grupo: lec.classification.grupo || '',
        tipo: lec.classification.tipo || '',
        subtipo: lec.classification.subtipo || ''
      },
      respostas: answers,
      comentarios: (lec.comentarios || []).map(comment => this.toComment(comment)),
      resultadoRules: lec.resultadoRules,
      parecerDevolucao: lec.parecerDevolucao || undefined,
      planoExecucao: lec.planoExecucao || undefined
    };
  }

  private toComment(comment: ApiComment): FieldComment {
    return {
      id: comment.id,
      perguntaId: comment.perguntaId,
      texto: comment.texto,
      resolvido: comment.resolvido,
      criadoEm: new Date(comment.criadoEm)
    };
  }
}
