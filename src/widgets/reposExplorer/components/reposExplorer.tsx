'use client';
import { RepoCard } from '@/entities/repositories';
import {
  useRepositoriesByOwnerLazyQuery,
} from '@/entities/repositories/gql/queries/repositoriesByOwner.graphql';
import { Input } from '@/shared/components/ui/Input';
import { Spinner } from '@/shared/components/ui/Spinner';
import { debounce } from '@/shared/helpers';
import { useState } from 'react';

export const ReposExplorer = () => {
  const [login, setLogin] = useState('');

  const [getRepos, { loading: isLoading, data }] =
    useRepositoriesByOwnerLazyQuery();
  const repos = data?.repositoryOwner?.repositories.nodes;

  function onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setLogin(e.target.value);

    const debounced = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      if (login) {
      
        getRepos({
          variables: {
            login: e.target.value,
            first: 10,
            after: null,
          },
          notifyOnNetworkStatusChange: true,
        });
      }
    }, 500);
    debounced(e);
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-prose">
      <Input
        {...{
          name: 'login',
          label: 'Логин GitHub',
          placeholder: 'Введите логин для поиска репозиториев',
          value: login,
          onChange: onSearch,
        }}
      />
      {!!repos?.length && (
        <div className="flex flex-col gap-3">
          {repos?.map(repo =>
            repo ? (
              <RepoCard
                key={repo.id}
                {...{
                  repo,
                }}
              />
            ) : null
          )}
        </div>
      )}
      {!!login && !isLoading && !repos?.length && <p>Репозитории не найдены</p>}
      {isLoading && <Spinner className="self-center" />}
    </div>
  );
};
